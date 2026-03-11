"use client";

import { useState } from "react";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: "sign-in" | "sign-up") => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3, "Name must be at least 3 characters") : z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });
};

const AuthForm = ({ type }: { type: "sign-in" | "sign-up" }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isSignIn = type === "sign-in";
  const formSchema = authFormSchema(type);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created! Let's get you signed in.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();

        if (!idToken) throw new Error("Failed to retrieve authentication token.");

        await signIn({ email, idToken });
        toast.success("Welcome back to Laksh.Ai");
        router.push("/");
      }
    } catch (error: any) {
      console.error(error);
      const message = error.code?.split('/')[1]?.replace(/-/g, ' ') || "Something went wrong.";
      toast.error(`Authentication Failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col w-full max-w-[450px] animate-in fade-in zoom-in duration-500">
      {/* Decorative background glow */}
      <div className="absolute -top-[10%] -left-[10%] w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="flex flex-col gap-8 p-8 border border-white/10 bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl">
        {/* Branding */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Image src="/logo.png" alt="logo" height={40} width={40} className="object-contain" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isSignIn ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSignIn 
                ? "Ready to ace your next interview?" 
                : "Start your journey to professional excellence today."}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {!isSignIn && (
              <div className="relative">
                <FormField
                  control={form.control}
                  name="name"
                  label="Full Name"
                  placeholder="John Doe"
                  type="text"
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="name@company.com"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="••••••••"
              type="password"
            />

            <Button 
              disabled={isLoading} 
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]"
              type="submit"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  {isSignIn ? "Sign In" : "Get Started"}
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0a0a0a] px-2 text-muted-foreground font-medium tracking-widest">OR</span>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {isSignIn ? "New to Laksh.Ai?" : "Already have an account?"}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="ml-1.5 font-semibold text-primary hover:underline underline-offset-4 transition-all"
          >
            {isSignIn ? "Create account" : "Sign in here"}
          </Link>
        </p>
      </div>
      
      {/* Footer Note */}
      <p className="mt-8 text-center text-xs text-muted-foreground/60 px-8">
        By continuing, you agree to Laksh.Ai's Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default AuthForm;