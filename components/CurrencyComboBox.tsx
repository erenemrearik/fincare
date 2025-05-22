"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Currencies, Currency } from "@/lib/currencies";
import SkeletonWrapper from "./SkeletonWrapper";
import { UserSettings } from "@prisma/client";
import { UpdateUserCurrency } from "@/app/wizard/_actions/userSettings";
import { toast } from "sonner";




function CurrencyComboBox() {
    const [open, setOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [selectedOption, setSelectedOption] = useState<Currency | null>(null);
    const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMutating, setIsMutating] = useState(false);

    const fetchUserSettings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/user-settings");
            const data = await response.json();
            setUserSettings(data);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserSettings();
    }, []);

    useEffect(() => {
        if (!userSettings) return;
        const userCurrency = Currencies.find((currency) => (
            currency.value === userSettings.currency
        ));
        if (userCurrency) setSelectedOption(userCurrency);
    }, [userSettings]);

    const updateCurrency = async (currencyValue: string) => {
        setIsMutating(true);
        try {
            const response = await UpdateUserCurrency(currencyValue);
            toast.success("Para birimi başarıyla güncellendi 🎉", {
                id: "update-currency"
            });

            setSelectedOption(
                Currencies.find(c => c.value === response.currency) || null
            );
        } catch (error) {
            toast.error("Bir şeyler yanlış gitti", {
                id: "update-currency"
            });
        } finally {
            setIsMutating(false);
        }
    };

    const selectOption = useCallback(
        (currency: Currency | null) => {
            if (!currency) {
                toast.error("Lütfen bir para birimi seçin");
                return;
            }

            toast.loading("Para birimi güncelleniyor...", {
                id: "update-currency"
            });

            updateCurrency(currency.value);
        },
        []
    );

    if (isDesktop) {
        return (
            <SkeletonWrapper isLoading={isLoading}>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            disabled={isMutating}
                        >
                            {selectedOption ? <>{selectedOption.label}</> : <>Para birimi seçin</>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="start">
                        <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
                    </PopoverContent>
                </Popover>
            </SkeletonWrapper>
        )
    }

    return (
        <SkeletonWrapper isLoading={isLoading} >
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        disabled={isMutating}
                    >
                        {selectedOption ? <>{selectedOption.label}</> : <>Para birimi seçin</>}
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className="mt-4 border-t">
                        <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
                    </div>
                </DrawerContent>
            </Drawer>
        </SkeletonWrapper>
    )
}

function OptionList({
    setOpen,
    setSelectedOption,
}: {
    setOpen: (open: boolean) => void
    setSelectedOption: (status: Currency | null) => void
}) {
    return (
        <Command>
            <CommandInput placeholder="Para birimi ara..." />
            <CommandList>
                <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                <CommandGroup>
                    {Currencies.map((currency: Currency) => (
                        <CommandItem
                            key={currency.value}
                            value={currency.value}
                            onSelect={(value) => {
                                setSelectedOption(
                                    Currencies.find((priority) => priority.value === value) || null
                                )
                                setOpen(false)
                            }}
                        >
                            {currency.label}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    )
}

export default CurrencyComboBox;