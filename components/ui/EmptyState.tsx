import { Button } from "flowbite-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {actionLabel && (actionHref || onAction) && (
        <Button
          href={actionHref}
          onClick={onAction}
          color="blue"
          size="sm"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
