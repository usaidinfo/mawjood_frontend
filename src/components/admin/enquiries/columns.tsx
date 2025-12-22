import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Enquiry, EnquiryStatus } from '@/services/enquiry.service';

export const createColumns = (
  onView: (enquiry: Enquiry) => void
): ColumnDef<Enquiry>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <span className="font-medium text-gray-900 dark:text-gray-100 truncate block" title={row.original.name}>
          {row.original.name}
        </span>
        <div className="text-xs text-gray-500 mt-0.5 truncate" title={row.original.email}>
          {row.original.email}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'business',
    header: 'Business',
    cell: ({ row }) => {
      const business = row.original.business as any;
      if (!business) return <span className="text-gray-400">N/A</span>;
      
      return (
        <div className="max-w-[200px]">
          <Link
            href={`/businesses/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary line-clamp-1"
          >
            {business.name}
          </Link>
          {business.category && (
            <div className="text-xs text-gray-500 mt-0.5">
              {business.category.name}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        {row.original.message ? (
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {row.original.message}
          </p>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">
            No message
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      
      const statusConfig: Record<EnquiryStatus, { label: string; className: string }> = {
        [EnquiryStatus.OPEN]: {
          label: 'Open',
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        },
        [EnquiryStatus.IN_PROGRESS]: {
          label: 'In Progress',
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        },
        [EnquiryStatus.CLOSED]: {
          label: 'Closed',
          className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        },
        [EnquiryStatus.REJECTED]: {
          label: 'Rejected',
          className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        },
      };

      const config = statusConfig[status] || statusConfig[EnquiryStatus.OPEN];

      return (
        <Badge className={config.className}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => (
      <a
        href={`tel:${row.original.phone}`}
        className="text-sm text-gray-700 dark:text-gray-300 hover:text-primary"
      >
        {row.original.phone}
      </a>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {format(new Date(row.original.createdAt), 'MMM dd, yyyy')}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const enquiry = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(enquiry)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {enquiry.business && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/businesses/${enquiry.business.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    View Business
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

