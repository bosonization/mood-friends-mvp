"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { startGlobalLoading } from "@/components/LoadingOverlay";

type TransitionLinkProps = ComponentProps<typeof Link>;

export function TransitionLink(props: TransitionLinkProps) {
  return <Link {...props} onClick={(event) => { props.onClick?.(event); if (!event.defaultPrevented) startGlobalLoading(); }} />;
}
