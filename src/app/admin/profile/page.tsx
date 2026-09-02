import { redirect } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarUploader } from "@/components/admin/profile/AvatarUploader";
import { PasswordForm, ProfileForm } from "@/components/admin/profile/Forms";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, phone, email, avatar_url")
    .eq("id", user.id)
    .single();

  const email = profile?.email ?? user.email ?? null;
  const fullName = profile?.full_name ?? "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          الملف الشخصي
        </h1>
        {email && (
          <Badge variant="outline" dir="ltr">
            {email}
          </Badge>
        )}
      </div>

      <Card>
        <CardContent>
          <AvatarUploader
            userId={user.id}
            fullName={fullName}
            avatarUrl={profile?.avatar_url ?? null}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <UserRound />
            المعلومات الشخصية
          </TabsTrigger>
          <TabsTrigger value="security">
            <KeyRound />
            الأمان
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardContent>
              <ProfileForm
                fullName={fullName}
                phone={profile?.phone ?? null}
                email={email}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
