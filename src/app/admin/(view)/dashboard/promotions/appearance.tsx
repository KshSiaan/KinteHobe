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

export default function Appearance({
  selectedVariant,
  setSelectedVariant,
}: {
  selectedVariant: string;
  setSelectedVariant: (variant: string) => void;
}) {
  return (
    <RadioGroup
      defaultValue="a"
      value={selectedVariant}
      onValueChange={setSelectedVariant}
      className="grid grid-cols-3"
    >
      <FieldLabel htmlFor="a">
        <Field orientation="horizontal" className="bg-background rounded-xl">
          <FieldContent>
            <FieldTitle>Type A</FieldTitle>
            <FieldDescription>
              simple and clean, suitable for simple promotions.
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem value="a" id="a" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="b">
        <Field orientation="horizontal" className="bg-background rounded-xl">
          <FieldContent>
            <FieldTitle>Type B</FieldTitle>
            <FieldDescription>Type A + Button</FieldDescription>
          </FieldContent>
          <RadioGroupItem value="b" id="b" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="c">
        <Field orientation="horizontal" className="bg-background rounded-xl">
          <FieldContent>
            <FieldTitle>Type C</FieldTitle>
            <FieldDescription>Type B + Gradient Background</FieldDescription>
          </FieldContent>
          <RadioGroupItem value="c" id="c" />
        </Field>
      </FieldLabel>
    </RadioGroup>
  );
}
