import * as React from "react"
import { cn } from "@/lib/utils"
import * as Vaul from "vaul"

export const Drawer = (
  {
    snapPoints = [0.15, 0.3, 0.5],
    activeSnapPoint = 0.15,
    ...rest
  }: React.ComponentPropsWithoutRef<typeof Vaul.Drawer.Root> & {
    snapPoints?: number[]
    activeSnapPoint?: number
  }
) => (
  <Vaul.Drawer.Root
    snapPoints={snapPoints}
    activeSnapPoint={activeSnapPoint}
    {...rest}
  >
    {rest.children}
  </Vaul.Drawer.Root>
)
Drawer.displayName = "Drawer"

export const DrawerTrigger = React.forwardRef<
  React.ElementRef<typeof Vaul.Drawer.Trigger>,
  React.ComponentPropsWithoutRef<typeof Vaul.Drawer.Trigger>
>(({ className, ...props }, ref) => (
  <Vaul.Drawer.Trigger
    ref={ref}
    className={cn("inline-flex items-center justify-center", className)}
    {...props}
  />
))
DrawerTrigger.displayName = "DrawerTrigger"

export const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof Vaul.Drawer.Overlay>,
  React.ComponentPropsWithoutRef<typeof Vaul.Drawer.Overlay>
>(({ className, ...props }, ref) => (
  <Vaul.Drawer.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
))
DrawerOverlay.displayName = "DrawerOverlay"

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof Vaul.Drawer.Content>,
  React.ComponentPropsWithoutRef<typeof Vaul.Drawer.Content>
>(({ className, children, ...props }, ref) => (
  <Vaul.Portal>
    <Vaul.Drawer.Overlay className="fixed inset-0 z-50 bg-black/80" />
    <Vaul.Drawer.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 rounded-t-xl border bg-card text-card-foreground shadow-lg",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </Vaul.Drawer.Content>
  </Vaul.Portal>
))
DrawerContent.displayName = "DrawerContent"

export const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

export const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

export const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof Vaul.Drawer.Title>,
  React.ComponentPropsWithoutRef<typeof Vaul.Drawer.Title>
>(({ className, ...props }, ref) => (
  <Vaul.Drawer.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
DrawerTitle.displayName = "DrawerTitle"

export const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof Vaul.Drawer.Description>,
  React.ComponentPropsWithoutRef<typeof Vaul.Drawer.Description>
>(({ className, ...props }, ref) => (
  <Vaul.Drawer.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = "DrawerDescription"