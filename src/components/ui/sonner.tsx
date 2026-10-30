import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded-xl border shadow-elevated font-sans',
          description: 'text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
