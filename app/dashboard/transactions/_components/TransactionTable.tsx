"use client";

import { GetTransactionHistoryResponseType } from '@/app/api/transactions-history/route';
import { DateToUTCDate } from '@/lib/helpers';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table"
import useSWR from 'swr';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { DataTableColumnHeader } from '@/components/dataTable/ColumnHeader';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { DataTableFacetedFilter } from '@/components/dataTable/data-table-faceted-filter';
import { DataTableViewOptions } from '@/components/dataTable/ColumnToggle';
import { Button } from '@/components/ui/button';
import { mkConfig, generateCsv, download } from "export-to-csv";
import { DownloadIcon, MoreHorizontal, TrashIcon } from 'lucide-react';
import DeleteTransactionDialog from './DeleteTransactionDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


interface Props {
    from: Date;
    to: Date
}

const emptyData: any[] = [];

type TransactionHistoryRow = GetTransactionHistoryResponseType[0] & {
    formattedAmount?: string;
};

// Tablo kolonlarının tanımı ve aksiyonlar
const columns: ColumnDef<TransactionHistoryRow>[] = [
    {
        accessorKey: "category",
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Kategori" />
        ),
        cell: ({ row }) => (
            <div className=" flex gap-2 capitalize">
                {row.original.categoryIcon}
                <div className=" capitalize">{row.original.category}</div>
            </div>
        )
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Açıklama" />
        ),
        cell: ({ row }) => (
            <div className="capitalize">
                {row.original.description}
            </div>
        )
    },
    {
        accessorKey: "date",
        header: "Tarih",
        cell: ({ row }) => {
            const date = new Date(row.original.date)
            const formattedDate = date.toLocaleString("default", {
                timeZone: "UTC",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            });
            return (
                <div className=" text-muted-foreground">
                    {formattedDate}
                </div>
            )
        }
    },
    {
        accessorKey: "type",
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tür" />
        ),
        cell: ({ row }) => (
            <div className={cn(" capitalize rounded-lg text-center p-2",
                row.original.type === "income" ? " bg-emerald-400/10 text-emerald-500" : " bg-red-400/10 text-red-500")}>
                {row.original.type === "income" ? "Gelir" : "Gider"}
            </div>
        )
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tutar" />
        ),
        cell: ({ row }) => (
            <p className="flex items-start text-md rounded-lg bg-gray-400/5 p-2 text-center font-medium">
                {row.original.formattedAmount}
            </p>
        )
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
            <RowActions transaction={row.original} />
        )
    },
]

// CSV dışa aktarma ayarları
const csvConfig = mkConfig({
    useKeysAsHeaders: true,
    fieldSeparator: ",",
    decimalSeparator: "."
});

// SWR ile veri çekme fonksiyonu
const fetcher = (url: string) => fetch(url).then(res => res.json());

/**
 * TransactionTable ana fonksiyonu
 * @param from - Başlangıç tarihi
 * @param to - Bitiş tarihi
 */
function TransactionTable({ from, to }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const url = `/api/transactions-history?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`;
    const { data: historyData = emptyData, isLoading, mutate } = useSWR(url, fetcher, { revalidateOnFocus: true });

    // CSV dışa aktarma işlemi
    const handleExportCSV = (data: any[]) => {
        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    }

    // React Table konfigürasyonu
    const table = useReactTable({
        data: historyData || emptyData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        initialState: {
            pagination: {
                pageSize: 4
            }
        },
        state: {
            sorting,
            columnFilters
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    // Kategorileri filtreleme için seçeneklerin hazırlanması
    const categoriesOption = useMemo(() => {
        const categoriesMap = new Map();
        historyData?.forEach((transaction: TransactionHistoryRow) => {
            categoriesMap.set(transaction.category, {
                value: transaction.category,
                label: `${transaction.categoryIcon} ${transaction.category}`
            });
        });
        const uniqueCategories = new Set(categoriesMap.values());
        return Array.from(uniqueCategories)
    }, [historyData])

    return (
        <div className=" w-full">
            {/* Filtreler ve aksiyon butonları */}
            <div className=" flex flex-wrap items-end justify-between gap-2 py-4">
                <div className="flex gap-2">
                    {
                        table.getColumn("category") && (
                            <DataTableFacetedFilter
                                title='Kategori'
                                column={table.getColumn("category")}
                                options={categoriesOption}
                            />
                        )
                    }
                    {
                        table.getColumn("type") && (
                            <DataTableFacetedFilter
                                title='Tür'
                                column={table.getColumn("type")}
                                options={[
                                    { label: "Gelir", value: "income" },
                                    { label: "Gider", value: "expense" },
                                ]}
                            />
                        )
                    }
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        className=' ml-auto h-8 lg:flex'
                        variant={'outline'}
                        size={"sm"}
                        onClick={() => {
                            const data = table.getFilteredRowModel().rows.map(row => ({
                                category: row.original.category,
                                categoryIcon: row.original.categoryIcon,
                                description: row.original.description,
                                type: row.original.type,
                                amount: row.original.amount,
                                formattedAmount: row.original.formattedAmount,
                                date: row.original.date,
                            }));
                            handleExportCSV(data);
                        }}
                    >
                        <DownloadIcon className='mr-2 h-4 w-4' />
                        CSV Dışa Aktar
                    </Button>
                    <DataTableViewOptions table={table} />
                </div>
            </div>
            {/* Tablo ve sayfalama */}
            <SkeletonWrapper isLoading={isLoading}>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Sonuç bulunamadı.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Önceki
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Sonraki
                    </Button>
                </div>
            </SkeletonWrapper >
        </div >
    )
}
export default TransactionTable;

/**
 * RowActions bileşeni, her satır için aksiyon menüsünü ve silme diyalogunu yönetir.
 */
function RowActions(
    {
        transaction
    }: {
        transaction: TransactionHistoryRow
    }) {

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    return (
        <>
            <DeleteTransactionDialog
                open={showDeleteDialog}
                setOpen={setShowDeleteDialog}
                transactionId={transaction.id}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={'ghost'} className=' h-8 w-8 p-0'>
                        <span className="sr-only">Menüyü aç</span>
                        <MoreHorizontal className='h-4 w-4' />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className='flex items-center gap-2'
                        onSelect={() => {
                            setShowDeleteDialog((prev) => !prev)
                        }}
                    >
                        <TrashIcon className=' h-4 w-4 text-muted-foreground' />
                        Sil
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu >
        </>
    )
}