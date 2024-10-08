import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue } from "@nextui-org/table";
import {
  Pagination, Spinner, Input, Button, DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Link,
} from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import { formatNumber } from '@/lib/utils/numbers'
import { Pool } from "./PoolsList";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import "./datatable.css";

export const revalidate = 0;

const networkOptions = [
  { name: "Ethereum", uid: "ethereum" }
];


export default function DataTable() {
  const [page, setPage] = React.useState(1);
  const [itemsCount, setItemsCount] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [pages, setPages] = React.useState<number>(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filterValue, setFilterValue] = React.useState("");


  let list = useAsyncList({
    async load() {
      let res = await fetch('/api/pools', { next: { revalidate: 3600 } });
      let json = await res.json();
      setIsLoading(false);
      setPages(Math.ceil(json.length / rowsPerPage));
      setItemsCount(json.length);
      return {
        items: json
      };
    },
    async sort({ items, sortDescriptor }) {
      return {

        items: items.sort((a: any, b: any) => {
          const column = sortDescriptor.column as string;
          let first = a[column];
          let second = b[column];
          let cmp = (parseInt(first) || first) < (parseInt(second) || second) ? -1 : 1;


          if (sortDescriptor.direction === "descending") {
            cmp *= -1;
          }

          return cmp;
        }),
      };
    },
  });


  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  const onRowsPerPageChange = React.useCallback((e: any) => {
    setRowsPerPage(Number(e.target.value));
    setPages(Math.ceil(itemsCount / Number(e.target.value)));
    setPage(1);
  }, [itemsCount]);


  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return list.items.slice(start, end);
  }, [page, rowsPerPage, list.items]);

  const onSearchChange = React.useCallback((value: any) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("")
    setPage(1)
  }, [])




  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    if (hasSearchFilter) {
      return list.items.filter((item: any) =>
        item.pair.toLowerCase().includes(filterValue.toLowerCase()) || item.symbol.toLowerCase().includes(filterValue.toLowerCase())
      ).slice(start, end);

    } else {
      return list.items.slice(start, end);

    }
  }, [page, rowsPerPage, list.items, filterValue])

  return (

    <>
      <div className="flex  gap-3 items-end">
        <Input
          isClearable
          className="w-full sm:max-w-[22%] border-none"
          placeholder="Search by name..."
          startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
          value={filterValue}
          onClear={() => onClear()}
          onValueChange={onSearchChange}
        />
        <div className="flex gap-3">
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button endContent={<ChevronDownIcon className="w-4 h-4" />} variant="flat">
                Network
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Network Selection"
              closeOnSelect={false}
              selectedKeys={networkOptions[0].uid}
              selectionMode="multiple"
            >
              {networkOptions.map((status) => (
                <DropdownItem key={status.uid} className="capitalize">
                  {status.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

        </div>
      </div>
      <div className="flex justify-between items-center ">
        <span className="text-default-400 text-small">Total {list.items.length} pools fetched</span>
        <label className="flex items-center text-default-400 text-small">
          Rows per page:
          <select
            className="bg-transparent outline-none border-none text-default-400 text-small"
            onChange={onRowsPerPageChange}
          >
            <option value="5">5</option>
            <option value="10" selected>10</option>
            <option value="15">15</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </label>
      </div>
      <Table
        aria-label="Pools table with pagination"
        sortDescriptor={list.sortDescriptor}
        onSortChange={list.sort}
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={(page: any) => setPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader>
          <TableColumn key="symbol" allowsSorting>Pool Name</TableColumn>
          <TableColumn key="feeTier" >Fee Tier</TableColumn>
          <TableColumn key="totalValueLockedUSD" allowsSorting>Total Value Locked</TableColumn>
          <TableColumn key="volumeUSD" allowsSorting>Volume 24H</TableColumn>
          <TableColumn key="feeUSD" allowsSorting>Fees 24H</TableColumn>
          <TableColumn key="txCount" allowsSorting>Tx Count 24H</TableColumn>
          <TableColumn key="createdAt" allowsSorting>Creation Date</TableColumn>
        </TableHeader>

        <TableBody
          items={filteredItems}
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
        >
          {(item: any) => (
            <TableRow className="text-left" key={item.id}>
              {(columnKey: any) => {
                switch (columnKey) {
                  case 'symbol':
                    return <TableCell>< Link className="text-[#4542E0] text-medium" href={item.link} target="_blank">{getKeyValue(item, columnKey)}</Link></TableCell>;
                  case 'feeTier':
                    // Add your custom rendering for feeTier here
                    return <TableCell>{getKeyValue(item, columnKey)}</TableCell>;
                  case 'totalValueLockedUSD':
                    // Add your custom rendering for totalValueLockedUSD here
                    return <TableCell >${formatNumber(parseFloat(getKeyValue(item, columnKey)))}</TableCell>;
                  case 'volumeUSD':
                    // Add your custom rendering for volumeUSD here
                    return <TableCell >${formatNumber(getKeyValue(item, columnKey))}</TableCell>;
                  case 'feeUSD':
                    // Add your custom rendering for feeUSD here
                    return <TableCell >${formatNumber(getKeyValue(item, columnKey))}</TableCell>;
                  case 'txCount':
                    // Add your custom rendering for txCount here
                    return <TableCell>{getKeyValue(item, columnKey)}</TableCell>;
                  case 'createdAt':
                    // Add your custom rendering for createdAt here
                    return <TableCell>{new Date(getKeyValue(item, columnKey) * 1000).toLocaleString()}</TableCell>;
                  default:
                    return <TableCell>{getKeyValue(item, columnKey)}</TableCell>;
                }
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>

    </>
  );
}
