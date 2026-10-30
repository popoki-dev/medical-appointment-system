import { useId, type ReactNode } from 'react'
import {
  Controller,
  type Control,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface FormFieldRenderProps<TValues extends FieldValues, TName extends FieldPath<TValues>> {
  field: ControllerRenderProps<TValues, TName>
  fieldState: ControllerFieldState
  /** Spread onto the input element for label association and a11y. */
  inputProps: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }
}

interface FormFieldProps<TValues extends FieldValues, TName extends FieldPath<TValues>> {
  control: Control<TValues>
  name: TName
  label?: string
  description?: ReactNode
  required?: boolean
  className?: string
  render: (props: FormFieldRenderProps<TValues, TName>) => ReactNode
}

/**
 * Connects any input to React Hook Form and renders a consistent label,
 * helper text and validation message around it.
 *
 * @example
 * <FormField control={form.control} name="email" label="Email"
 *   render={({ field, inputProps }) => <Input {...field} {...inputProps} />} />
 */
export function FormField<TValues extends FieldValues, TName extends FieldPath<TValues>>({
  control,
  name,
  label,
  description,
  required,
  className,
  render,
}: FormFieldProps<TValues, TName>) {
  const id = useId()
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const describedBy = [description && descriptionId, fieldState.error && errorId].filter(Boolean).join(' ')
        return (
          <div className={cn('space-y-2', className)}>
            {label && (
              <Label htmlFor={id} className={cn(fieldState.error && 'text-destructive')}>
                {label}
                {required && <span className="ml-0.5 text-destructive">*</span>}
              </Label>
            )}
            {render({
              field,
              fieldState,
              inputProps: { id, 'aria-invalid': !!fieldState.error, 'aria-describedby': describedBy || undefined },
            })}
            {description && !fieldState.error && (
              <p id={descriptionId} className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
            {fieldState.error && (
              <p id={errorId} className="text-xs font-medium text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )
      }}
    />
  )
}
