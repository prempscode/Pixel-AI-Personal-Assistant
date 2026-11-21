import { HugeiconsIcon } from "@hugeicons/react";
import CalendarDaysIcon from "@hugeicons/core-free-icons/CalendarDaysIcon";
import FolderOpenIcon from "@hugeicons/core-free-icons/FolderOpenIcon";
import GlobalIcon from "@hugeicons/core-free-icons/GlobalIcon";
import ListTodoIcon from "@hugeicons/core-free-icons/ListTodoIcon";
import Mail01Icon from "@hugeicons/core-free-icons/Mail01Icon";
import { cn } from "../../lib/cn";

const services = {
  tasks: ListTodoIcon,
  calendar: CalendarDaysIcon,
  gmail: Mail01Icon,
  drive: FolderOpenIcon,
  utility: GlobalIcon,
};

export default function ServiceIcon({ service, size = 16, className }) {
  const icon = services[service];

  if (!icon) {
    throw new Error(`Unknown service icon: ${service}`);
  }

  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
      strokeWidth={1.7}
    />
  );
}
