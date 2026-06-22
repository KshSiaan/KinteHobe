"use client";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import {
  BriefcaseBusinessIcon,
  CloverIcon,
  HandshakeIcon,
  HomeIcon,
  MapPinPenIcon,
} from "lucide-react";
import {
  SavedLocationCard,
  type UserAddress,
} from "@/components/core/base/saved-location";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const locationSchema = z.object({
  label: z.string().min(1, "Label is required"),
  recipient_name: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  area: z.string().min(1, "Area is required"),
  address_line: z.string().min(1, "Address line is required"),
  is_default: z.boolean().optional(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

const LABEL_PRESETS = [
  { value: "Home", icon: HomeIcon },
  { value: "Office", icon: BriefcaseBusinessIcon },
  { value: "Family", icon: CloverIcon },
  { value: "Friend", icon: HandshakeIcon },
] as const;

interface LocationFormProps {
  defaultValues: LocationFormValues;
  onSubmit: (values: LocationFormValues) => Promise<void>;
  submitting: boolean;
}

function LocationForm({
  defaultValues,
  onSubmit,
  submitting,
}: LocationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues,
  });

  const currentLabel = watch("label");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="grid grid-cols-3 gap-4">
        <Field>
          <FieldLabel>Label</FieldLabel>
          <Input {...register("label")} />
          {errors.label && (
            <p className="text-xs text-destructive mt-1">
              {errors.label.message}
            </p>
          )}
          <div className="grid grid-cols-4 gap-4 mt-2">
            {LABEL_PRESETS.map(({ value, icon: Icon }) => (
              <Button
                key={value}
                size="sm"
                className="text-xs"
                variant={currentLabel === value ? "default" : "outline"}
                type="button"
                onClick={() =>
                  setValue("label", value, { shouldValidate: true })
                }
              >
                <Icon />
                {value}
              </Button>
            ))}
          </div>
        </Field>
        <Field>
          <FieldLabel>Recipient Name (Optional)</FieldLabel>
          <Input placeholder="John Doe" {...register("recipient_name")} />
        </Field>
        <Field>
          <FieldLabel>Phone number</FieldLabel>
          <Input placeholder="+880123456789" {...register("phone")} />
          {errors.phone && (
            <p className="text-xs text-destructive mt-1">
              {errors.phone.message}
            </p>
          )}
        </Field>
        <Field>
          <FieldLabel>District</FieldLabel>
          <Input placeholder="Dhaka" {...register("district")} />
          {errors.district && (
            <p className="text-xs text-destructive mt-1">
              {errors.district.message}
            </p>
          )}
        </Field>
        <Field>
          <FieldLabel>City</FieldLabel>
          <Input placeholder="Dhaka" {...register("city")} />
          {errors.city && (
            <p className="text-xs text-destructive mt-1">
              {errors.city.message}
            </p>
          )}
        </Field>
        <Field>
          <FieldLabel>Area</FieldLabel>
          <Input placeholder="Mirpur" {...register("area")} />
          {errors.area && (
            <p className="text-xs text-destructive mt-1">
              {errors.area.message}
            </p>
          )}
        </Field>
        <Field className="col-span-3">
          <FieldLabel>Address Line</FieldLabel>
          <Input placeholder="123 Main Street" {...register("address_line")} />
          {errors.address_line && (
            <p className="text-xs text-destructive mt-1">
              {errors.address_line.message}
            </p>
          )}
        </Field>
      </FieldGroup>
      <p className="text-xs text-muted-foreground w-2/3 my-4">
        <b>Note: </b>Your location information is securely stored and used to
        provide personalized experiences. Our privacy policy ensures that your
        data is handled responsibly and in compliance with applicable
        regulations.
      </p>
      <div className="flex justify-end items-center">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Location"}
        </Button>
      </div>
    </form>
  );
}

export default function Location() {
  const { data: session } = authClient.useSession();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editAddress, setEditAddress] = useState<UserAddress | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/manage/location");
      const json = await res.json();
      if (json.data) setAddresses(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  async function handleAdd(values: LocationFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/manage/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        setAddOpen(false);
        await fetchAddresses();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(values: LocationFormValues) {
    if (!editAddress) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/manage/location?id=${editAddress.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        setEditAddress(null);
        await fetchAddresses();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/manage/location?id=${id}`, { method: "DELETE" });
    await fetchAddresses();
  }

  async function handleSetDefault(id: string) {
    const address = addresses.find((a) => a.id === id);
    if (!address) return;
    await fetch(`/api/manage/location?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...address, is_default: true }),
    });
    await fetchAddresses();
  }

  const userName = session?.user?.name ?? "";

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Saved Locations</CardTitle>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <MapPinPenIcon /> Add a new Location
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:min-w-[60dvw]">
              <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
                <DialogDescription>
                  Enter the details for your new location.
                </DialogDescription>
              </DialogHeader>
              <LocationForm
                defaultValues={{
                  label: "",
                  recipient_name: userName,
                  phone: "",
                  district: "",
                  city: "",
                  area: "",
                  address_line: "",
                  is_default: addresses.length === 0,
                }}
                onSubmit={handleAdd}
                submitting={submitting}
              />
            </DialogContent>
          </Dialog>
        </div>

        <CardDescription>
          Manage your saved locations for quick access and personalized
          experiences.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : addresses.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MapPinPenIcon />
              </EmptyMedia>
              <EmptyTitle>No saved locations</EmptyTitle>
              <EmptyDescription>
                Add a location to speed up checkout and get personalized
                delivery options.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          addresses.map((address) => (
            <SavedLocationCard
              key={address.id}
              address={address}
              onEdit={setEditAddress}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))
        )}
      </CardContent>

      <Dialog
        open={!!editAddress}
        onOpenChange={(open) => !open && setEditAddress(null)}
      >
        <DialogContent className="sm:min-w-[60dvw]">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              Update the details for this location.
            </DialogDescription>
          </DialogHeader>
          {editAddress && (
            <LocationForm
              defaultValues={{
                label: editAddress.label,
                recipient_name: editAddress.recipient_name ?? "",
                phone: editAddress.phone,
                district: editAddress.district,
                city: editAddress.city,
                area: editAddress.area,
                address_line: editAddress.address_line,
                is_default: editAddress.is_default,
              }}
              onSubmit={handleEdit}
              submitting={submitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
