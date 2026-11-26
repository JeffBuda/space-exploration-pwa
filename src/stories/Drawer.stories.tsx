import type { Meta, StoryObj } from "@storybook/react"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

interface StoryDrawerProps {
  snapPoint?: "15%" | "30%" | "50%"
}

const meta: Meta<StoryDrawerProps> = {
  title: "UI/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  argTypes: {
    snapPoint: {
      control: "select",
      options: ["15%", "30%", "50%"],
      description: "Active snap point",
    },
  },
}

export default meta
type Story = StoryObj<StoryDrawerProps>

const snapPointOptions = ["15%", "30%", "50%"] as const

const DrawerView = ({ snapPoint = "15%" }: { snapPoint?: string }) => {
  const snapPointNum = parseInt(snapPoint, 10) / 100

  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="flex gap-2">
        {snapPointOptions.map((sp) => (
          <button
            key={sp}
            className={cn(
              "px-3 py-1 rounded-md text-sm",
              snapPoint === sp
                ? "bg-cyan-600 text-white"
                : "bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/30",
            )}
          >
            {sp}
          </button>
        ))}
      </div>

      <Drawer snapPoints={[0.15, 0.3, 0.5]} activeSnapPoint={snapPointNum}>
        <DrawerTrigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-cyan-600 text-white text-sm font-medium shadow-lg shadow-cyan-600/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="-ml-1 inline w-4 h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Open Drawer
          </button>
        </DrawerTrigger>

        <DrawerOverlay className="fixed inset-0 z-50 bg-black/80" />

        <DrawerContent>
          <div className="text-sm text-cyan-200/60 mb-4">
            Active snap point: <strong>{snapPoint}</strong>
          </div>

          <DrawerHeader>
            <DrawerTitle>Itinerary</DrawerTitle>
            <p className="text-sm text-cyan-200/60">Select itinerary state</p>
          </DrawerHeader>

          <div className="p-4 space-y-4">
            <div className="h-[120px] w-full rounded-lg bg-cyan-900/30 border border-cyan-700 flex items-center justify-center text-cyan-200/60">
              <span>15% state</span>
            </div>

            <div className="h-[180px] w-full rounded-lg bg-cyan-900/20 border border-cyan-700 flex items-center justify-center text-cyan-200/60">
              <span>30% state</span>
            </div>

            <div className="h-[240px] w-full rounded-lg bg-cyan-900/20 border border-cyan-700 flex items-center justify-center text-cyan-200/60">
              <span>50% state</span>
            </div>
          </div>

          <DrawerFooter className="space-y-2">
            <button className="w-full px-4 py-2 rounded-md bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-500">
              Close Itinerary
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export const Primary: StoryObj<StoryDrawerProps> = {
  args: { snapPoint: "15%" },
  render: (args) => <DrawerView {...args} />,
}

export const With30Percent: StoryObj<StoryDrawerProps> = {
  args: { snapPoint: "30%" },
  render: (args) => <DrawerView {...args} />,
}

export const With50Percent: StoryObj<StoryDrawerProps> = {
  args: { snapPoint: "50%" },
  render: (args) => <DrawerView {...args} />,
}