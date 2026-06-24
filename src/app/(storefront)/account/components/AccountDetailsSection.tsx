"use client";

import { MapPin } from "lucide-react";
import type { AccountData } from "./types";
import { AddressSection } from "./AddressSection";

type Props = {
  data: AccountData;
  onUpdateAddress: (updated: NonNullable<AccountData["defaultShipping"]>) => void;
};

export function AccountDetailsSection({ data, onUpdateAddress }: Props) {
  const fullName = data.profile
    ? `${data.profile.firstName ?? ""} ${data.profile.lastName ?? ""}`.trim()
    : data.user.email;

  return (
    <section className="bg-white rounded-lg border border-[#E5E5E5] p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <MapPin size={20} className="text-[#f97316]" />
        <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-[#191A1C]" style={{ fontFamily: "var(--font-oswald-next)" }}>
          Account Details
        </h2>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <p className="font-open-sans text-xs text-[#777777] uppercase tracking-wider mb-1">Email</p>
          <p className="font-open-sans text-sm text-[#191A1C]">{data.user.email}</p>
        </div>
        {fullName && (
          <div>
            <p className="font-open-sans text-xs text-[#777777] uppercase tracking-wider mb-1">Name</p>
            <p className="font-open-sans text-sm text-[#191A1C]">{fullName}</p>
          </div>
        )}
        {data.profile?.phone && (
          <div>
            <p className="font-open-sans text-xs text-[#777777] uppercase tracking-wider mb-1">Phone</p>
            <p className="font-open-sans text-sm text-[#191A1C]">{data.profile.phone}</p>
          </div>
        )}
      </div>

      <AddressSection defaultShipping={data.defaultShipping} onUpdate={onUpdateAddress} />
    </section>
  );
}
