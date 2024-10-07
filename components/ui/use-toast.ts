import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"
import { useToast as useToastOriginal } from "@/components/ui/toast"

export { Toast, type ToastActionElement, type ToastProps }

export const useToast = useToastOriginal