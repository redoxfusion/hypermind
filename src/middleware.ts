import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes to protect (in this case, all routes)
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)", "/sign-up(.*)", "/api/(.*)", // Exclude api, sign-in, sign-up, and Clerk internal routes
]);

export default clerkMiddleware(async (auth, req) => {
  // const { userId, sessionId, debug } = await auth();
  // console.log("Middleware triggered for:", req.url);
  // console.log("Auth state - UserID:", userId, "SessionID:", sessionId);
  // // console.log("Debug info:", debug);

  // if (!isPublicRoute(req)) {
  //   console.log("Protected route accessed:", req.url);
  //   if (!userId) {
  //     console.log("No user authenticated, redirecting to sign-in");
  //   }
  //   await auth.protect();
  // } else {
  //   console.log("Public route accessed:", req.url);
  // }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};