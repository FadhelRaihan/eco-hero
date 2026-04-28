"use client"

import * as React from "react"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
} from "@tanstack/react-table"
import {
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconLayoutColumns,
    IconSearch,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" 
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    filterColumn?: string
    searchPlaceholder?: string
    extraActions?: React.ReactNode
}

export function DataTable<TData, TValue>({
    columns,
    data,
    filterColumn = "full_name",
    searchPlaceholder = "Cari data...",
    extraActions
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [sorting, setSorting] = React.useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <div className="w-full space-y-4">
            {/* Table Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full md:w-80 group">
                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1A5C0A] transition-colors" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn(filterColumn)?.setFilterValue(event.target.value)
                        }
                        className="pl-12 h-12 bg-white border-2 text-xs border-gray-100 focus:border-[#1A5C0A] rounded-xl shadow-sm transition-all font-medium"
                    />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    {extraActions}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-12 w-full md:w-auto px-5 border-2 border-gray-100 rounded-xl font-bold text-gray-600 hover:text-[#1A5C0A] hover:border-[#1A5C0A] transition-all bg-white"
                            >
                                <IconLayoutColumns className="w-4 h-4 mr-2" />
                                Kolom
                                <IconChevronDown className="w-3 h-3 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl border-none shadow-2xl p-2">
                            <p className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">Tampilkan Kolom</p>
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        typeof column.accessorFn !== "undefined" &&
                                        column.getCanHide()
                                )
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize rounded-xl font-bold text-xs py-2 mb-1"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id.split('_').join(' ')}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table Content */}
            <div className="overflow-hidden rounded-xl p-2 border border-gray-100 bg-white shadow-sm">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b-gray-100">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className="h-14 px-6 text-[11px] font-black uppercase tracking-[0.1em] text-[#1A5C0A]/60"
                                        >
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
                                    className="group hover:bg-gray-50/50 transition-colors border-b-gray-50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-6 py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-32 text-center text-gray-400 font-medium italic"
                                >
                                    Tidak ada data yang ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center md:justify-between px-6 py-2">
                <div className="hidden items-center gap-2 lg:flex">
                    <Label htmlFor="rows-per-page" className="text-xs font-black uppercase tracking-widest text-gray-400">
                        Baris per hal
                    </Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-10 w-20 bg-white border-2 border-transparent hover:border-gray-100 rounded-xl font-bold shadow-none transition-all flex items-center justify-between px-3"
                                id="rows-per-page"
                            >
                                {table.getState().pagination.pageSize}
                                <IconChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="end" className="w-24 rounded-2xl border-none shadow-2xl p-2">
                            <DropdownMenuRadioGroup
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => table.setPageSize(Number(value))}
                            >
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <DropdownMenuRadioItem
                                        key={pageSize}
                                        value={`${pageSize}`}
                                        className="rounded-xl font-bold text-xs py-2"
                                    >
                                        {pageSize}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex w-fit items-center justify-center text-xs font-black uppercase tracking-widest text-[#1A5C0A]">
                        Hal {table.getState().pagination.pageIndex + 1} dari{" "}
                        {table.getPageCount()}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            className="hidden h-10 w-10 p-0 lg:flex hover:bg-[#1A5C0A]/5 text-gray-400 hover:text-[#1A5C0A] rounded-xl"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <IconChevronsLeft className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="h-10 w-10 p-0 hover:bg-[#1A5C0A]/5 text-gray-400 hover:text-[#1A5C0A] rounded-xl"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <IconChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="h-10 w-10 p-0 hover:bg-[#1A5C0A]/5 text-gray-400 hover:text-[#1A5C0A] rounded-xl"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <IconChevronRight className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="hidden h-10 w-10 p-0 lg:flex hover:bg-[#1A5C0A]/5 text-gray-400 hover:text-[#1A5C0A] rounded-xl"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <IconChevronsRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
