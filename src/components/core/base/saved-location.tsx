"use client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MapPinIcon, PencilIcon, StarIcon, Trash2Icon } from "lucide-react";

export type UserAddress = {
  id: string;
  label: string;
  recipient_name: string | null;
  phone: string;
  district: string;
  city: string;
  area: string;
  address_line: string;
  is_default: boolean;
  createdAt: string;
};

interface SavedLocationCardProps {
  address: UserAddress;
  onEdit: (address: UserAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function SavedLocationCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: SavedLocationCardProps) {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg gap-4">
      <div className="flex gap-3 min-w-0">
        <MapPinIcon className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{address.label}</span>
            {address.is_default && <Badge variant="secondary">Default</Badge>}
          </div>
          {address.recipient_name && (
            <p className="text-sm text-muted-foreground">
              {address.recipient_name}
            </p>
          )}
          <p className="text-sm text-muted-foreground">{address.phone}</p>
          <p className="text-sm truncate">
            {address.address_line}, {address.area}, {address.city},{" "}
            {address.district}
          </p>
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        {!address.is_default && (
          <Button
            size="icon"
            variant="ghost"
            title="Set as default"
            onClick={() => onSetDefault(address.id)}
          >
            <StarIcon className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          title="Edit"
          onClick={() => onEdit(address)}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost" title="Delete">
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete location?</AlertDialogTitle>
              <AlertDialogDescription>
                &quot;{address.label}&quot; will be permanently removed. This
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(address.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Self-fetching read-only list used in Navbar popover
export default function SavedLocation() {
  const { data: addresses = [], isLoading } = useQuery<UserAddress[]>({
    queryKey: ["saved-locations"],
    queryFn: () =>
      fetch("/api/manage/location")
        .then((r) => r.json())
        .then((json) => json.data ?? []),
  });

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground px-2 py-4">Loading...</p>
    );
  }

  if (addresses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground px-2 py-4">
        No saved locations.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-2">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="flex gap-2 items-start px-1 py-1.5 rounded-md hover:bg-muted text-sm"
        >
          <MapPinIcon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium">{address.label}</span>
              {address.is_default && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  Default
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground truncate">
              {address.address_line}, {address.area}, {address.city}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
