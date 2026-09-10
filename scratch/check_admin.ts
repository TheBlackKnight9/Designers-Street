import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const prisma = new PrismaClient();

async function main() {
  const targetEmail = "prerakcharan@gmail.com";
  const targetPass = "DStreet@911";

  console.log("Checking Supabase Auth for:", targetEmail);
  const { data: userList, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error("List users error:", listErr);
  } else {
    console.log(`Found ${userList.users.length} users in Supabase Auth`);
    const existing = userList.users.find(
      (u) => u.email?.toLowerCase() === targetEmail.toLowerCase()
    );
    if (existing) {
      console.log("User exists in auth:", existing.id);
      const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
        password: targetPass,
        user_metadata: { role: "admin", full_name: "Prerak Charan" },
        email_confirm: true,
      });
      if (updateErr) console.error("Error updating user password/metadata:", updateErr);
      else console.log("Updated password & admin role for existing user!");
    } else {
      console.log("Creating user in Supabase Auth...");
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: targetEmail,
        password: targetPass,
        email_confirm: true,
        user_metadata: { role: "admin", full_name: "Prerak Charan" },
      });
      if (createErr) console.error("Error creating user:", createErr);
      else console.log("Created new admin user in Supabase Auth:", newUser.user?.id);
    }
  }

  // Also ensure in Prisma User table
  try {
    const dbUser = await prisma.user.upsert({
      where: { email: targetEmail },
      create: {
        email: targetEmail,
        name: "Prerak Charan",
        role: "admin",
      },
      update: {
        name: "Prerak Charan",
        role: "admin",
      },
    });
    console.log("Prisma User synced:", dbUser.id, dbUser.role);
  } catch (err) {
    console.error("Prisma error:", err);
  }
}

main().finally(() => prisma.$disconnect());
