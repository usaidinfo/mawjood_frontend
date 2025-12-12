'use client';

import { ColumnDef } from '@tanstack/react-table';
import { TouristPlace } from '@/services/touristPlace.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface ColumnsProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (slug: string) => void;
}

export const createColumns = ({ onEdit, onDelete, onView }: ColumnsProps): ColumnDef<TouristPlace>[] => [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const place = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{place.title}</span>
          {place.subtitle && (
            <span className="text-sm text-gray-500">{place.subtitle}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'city',
    header: 'City',
    cell: ({ row }) => {
      const city = row.original.city;
      return <span>{city?.name || 'N/A'}</span>;
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'attractions',
    header: 'Attractions',
    cell: ({ row }) => {
      const place = row.original;
      // Use _count if available, otherwise use array length
      const count = place._count?.attractions ?? (place.attractions?.length || 0);
      return <span>{count}</span>;
    },
  },
  {
    accessorKey: 'businessSections',
    header: 'Business Sections',
    cell: ({ row }) => {
      const place = row.original;
      // Use _count if available, otherwise use array length
      const count = place._count?.businessSections ?? (place.businessSections?.length || 0);
      return <span>{count}</span>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return <span className="text-sm text-gray-600">{format(date, 'MMM dd, yyyy')}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const place = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(place.slug)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(place.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(place.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

