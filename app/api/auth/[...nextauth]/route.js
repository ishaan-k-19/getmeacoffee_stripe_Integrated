import NextAuth from 'next-auth'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from "next-auth/providers/github"
import User from '@/models/User'
import {connectDB} from '@/db/connectDb'

// Create the auth options configuration
const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ,
      clientSecret: process.env.GITHUB_SECRET 
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET 
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET
    })
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        await connectDB()
        const currentUser = await User.findOne({ email: user.email })
        if (!currentUser) {
          await User.create({
            email: user.email,
            username: user.email.split("@")[0],
          })
        }
        return true
      } catch (error) {
        console.error("Sign in error:", error)
        return false
      }
    },
    async session({ session, user, token }) {
      try {
        const dbUser = await User.findOne({ email: session.user.email })
        if (dbUser) {
          session.user.name = dbUser.username
          session.user.email = dbUser.email
        }
        return session
      } catch (error) {
        console.error("Session error:", error)
        return session
      }
    }
  }
}

// Create the handlers
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }