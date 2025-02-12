import PaymentPage from "@/components/PaymentPage";
import React from "react";
import { notFound } from "next/navigation"
import {connectDB} from "@/db/connectDb";
import User from "@/models/User";

const Username = async ({params}) => {
      // if the username is not present in the database show 404 notfound
      const toPlainObject = (doc) => {
        const plainDoc = { ...doc, _id: doc._id.toString() };
        return plainDoc;
      };

      const checkUser = async () =>{
        await connectDB()
        let u = await User.findOne({username: params.username}).lean();
        if (!u) {
          return notFound();
        }
        return toPlainObject(u);
      };
    
      const user = await checkUser();

  return (
    <>
      <PaymentPage username={params.username}/>
    </>
  );
};

export default Username;


export async function generateMetadata({ params }) {
  return{
    title: `${params.username} - Get Me A Coffee`,
  }
}