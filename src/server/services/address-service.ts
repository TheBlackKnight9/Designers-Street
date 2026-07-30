import { AddressRepository } from "@/server/repositories/address-repository";
import { isDatabaseEnabled } from "@/server/utils/env";
import { NotFoundError, ValidationError } from "@/server/errors";
import { optionalString, requireString } from "@/server/utils/validation";

export type AddressInput = {
  label?: string | null;
  fullName: string;
  phone?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
};

function parseAddressBody(body: Record<string, unknown>): AddressInput {
  return {
    label: optionalString(body.label) ?? null,
    fullName: requireString(body.fullName ?? body.full_name, "fullName"),
    phone: optionalString(body.phone) ?? null,
    line1: requireString(body.line1, "line1"),
    line2: optionalString(body.line2) ?? null,
    city: requireString(body.city, "city"),
    state: requireString(body.state, "state"),
    postalCode: requireString(
      body.postalCode ?? body.postal_code,
      "postalCode"
    ),
    country: optionalString(body.country) ?? "IN",
    isDefault: Boolean(body.isDefault ?? body.is_default),
  };
}

export class AddressService {
  constructor(private readonly addresses = new AddressRepository()) {}

  private requireDb() {
    if (!isDatabaseEnabled()) {
      throw new ValidationError("Addresses require USE_DATABASE=true");
    }
  }

  async list(userId: string) {
    this.requireDb();
    return this.addresses.listByUser(userId);
  }

  async create(userId: string, body: Record<string, unknown>) {
    this.requireDb();
    return this.addresses.create(userId, parseAddressBody(body));
  }

  async update(userId: string, id: string, body: Record<string, unknown>) {
    this.requireDb();
    const existing = await this.addresses.findById(id, userId);
    if (!existing) throw new NotFoundError("Address not found");
    const merged: Record<string, unknown> = {
      label: existing.label,
      fullName: existing.fullName,
      phone: existing.phone,
      line1: existing.line1,
      line2: existing.line2,
      city: existing.city,
      state: existing.state,
      postalCode: existing.postalCode,
      country: existing.country,
      isDefault: existing.isDefault,
      ...body,
    };
    const parsed = parseAddressBody(merged);
    return this.addresses.update(id, userId, parsed);
  }

  async remove(userId: string, id: string) {
    this.requireDb();
    const existing = await this.addresses.findById(id, userId);
    if (!existing) throw new NotFoundError("Address not found");
    await this.addresses.delete(id, userId);
  }
}
