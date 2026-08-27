"use client";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React from "react";

export default function Variants({
  selectedVariant,
  setSelectedVariant,
}: {
  selectedVariant: string;
  setSelectedVariant: (variant: string) => void;
}) {
  return (
    <RadioGroup
      defaultValue="primary"
      value={selectedVariant}
      onValueChange={setSelectedVariant}
      className="grid grid-cols-4"
    >
      <FieldLabel htmlFor="primary">
        <Field orientation="horizontal" className="bg-background rounded-xl">
          <FieldContent>
            <FieldTitle>Primary</FieldTitle>
            <FieldDescription>
              Brightest and most prominent variant.
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem value="primary" id="primary" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="secondary">
        <Field orientation="horizontal" className="bg-background rounded-xl">
          <FieldContent>
            <FieldTitle>Secondary</FieldTitle>
            <FieldDescription>Light and subtle</FieldDescription>
          </FieldContent>
          <RadioGroupItem value="secondary" id="secondary" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="background">
        <Field orientation="horizontal" className="bg-background rounded-xl">
          <FieldContent>
            <FieldTitle>Background-wise</FieldTitle>
            <FieldDescription>
              Light for ligh theme, vise versa.
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem value="background" id="background" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="foreground">
        <Field orientation="horizontal" className="bg-background rounded-xl">
          <FieldContent>
            <FieldTitle>Foreground-wise</FieldTitle>
            <FieldDescription>
              Dark for light theme, vise versa.
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem value="foreground" id="foreground" />
        </Field>
      </FieldLabel>
    </RadioGroup>
  );
}
