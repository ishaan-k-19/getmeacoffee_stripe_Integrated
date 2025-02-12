"use client";
import React, { useEffect, useState } from 'react';
import { fetchuser, fetchpayments, fetchAndUpdatePaymentStatus } from '@/actions/useractions';
import { useSearchParams } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Gallery from './Gallery';

const PaymentPage = ({ username }) => {
    const [paymentform, setPaymentForm] = useState({ name: '', message: '', amount: '' });
    const [currentUser, setCurrentUser] = useState({});
    const [payments, setPayments] = useState([]);
    const [activeTab, setActiveTab] = useState('donations'); 
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        if (searchParams.get("paymentdone") === "true") {
            updatePayStatus(searchParams.get("session_id"));
            toast(`Thanks for the Donation!`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        } else if (searchParams.get("paymentdone") === "false") {
            toast('Transaction Cancelled!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        }
        setTimeout(() => {
            router.push(`/${username}`);
        }, 500);
    }, [searchParams, router, username]);

    const handleChange = (e) => {
        setPaymentForm({ ...paymentform, [e.target.name]: e.target.value });
    };

    const getData = async () => {
        let u = await fetchuser(username);
        setCurrentUser(u);
        let dbPayments = await fetchpayments(username);
        setPayments(dbPayments);
    };

    const updatePayStatus = async (sessionId) => {
        if (sessionId) {
            const result = await fetchAndUpdatePaymentStatus(sessionId, true);
            if (result.success) {
                console.log("Payment status updated successfully");
            } else {
                console.error(result.message);
            }
        }
    };

    const pay = async (amount) => {
        const stripeSecret = currentUser.stripesecret;
        try {
            const response = await fetch('https://getmeacoffee.online/api/checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, username, paymentform, stripeSecret }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error: ${response.status} - ${text}`);
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error('Failed to create checkout session:', error);
        }
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <div className="cover w-full bg-red-50 relative flex justify-center">
                <img
                    className="object-cover w-full h-[400px]"
                    src={currentUser.coverpic}
                    alt=""
                />
                <div className="absolute -bottom-14">
                    <img
                        className="object-cover h-40 w-40 rounded-2xl border-2 border-white"
                        src={currentUser.profilepic}
                        alt=""
                    />
                </div>
            </div>
            <div className="info flex flex-col justify-center items-center my-16">
                <div className="font-bold">@{username}</div>
                <div className="text-slate-400">let&apos;s help {currentUser.name} to get a coffee!</div>
                <div className="text-slate-400">
                    {payments.length} Payments . ${payments.reduce((a, b) => a + b.amount, 0)} raised
                </div>

                {/* Tabs for Donations and My Works */}
                <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700 w-[80%] mt-8">
                    <ul className="flex -mb-px justify-center">
                        <li className="me-2 w-full">
                            <button
                                onClick={() => setActiveTab('donations')}
                                className={`inline-block py-4 border-b-2 rounded-t-lg w-full ${
                                    activeTab === 'donations'
                                        ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                        : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                                }`}
                                aria-current={activeTab === 'donations' ? 'page' : undefined}
                            >
                                Donations
                            </button>
                        </li>
                        <li className="me-2 w-full">
                            <button
                                onClick={() => setActiveTab('works')}
                                className={`inline-block py-4 border-b-2 rounded-t-lg w-full ${
                                    activeTab === 'works'
                                        ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                        : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                                }`}
                            >
                                WorkShop
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Content based on active tab */}
                {activeTab === 'donations' && (
                    <div className="payment flex gap-3 w-[80%] mt-11 flex-col md:flex-row">
                        {/* Show list of all the supporters as a leaderboard */}
                        <div className="supporters md:w-1/2 w-full bg-neutral-800 rounded-lg p-10">
                            <h2 className="text-xl font-bold my-5">Top 10 Supporters</h2>
                            <ul className="mx-5 text-lg">
                                {payments.length === 0 && <li className='text-center my-24'>No payments yet</li>}
                                {payments.map((p, i) => (
                                    <li key={p._id} className="my-4 flex gap-2 items-center">
                                        <img width={30} src="avatar.gif" alt="user avatar" />
                                        <span>{p.name} <span className="font-bold"> ${p.amount} </span><br /><span className="text-orange-500 font-semibold">{p.message}</span></span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="makepayment md:w-1/2 w-full bg-neutral-800 rounded-lg p-10">
                            <h2 className="text-xl font-bold my-5">Make a payment</h2>
                            <div className="flex flex-col gap-2">
                                <input onChange={handleChange} type="text" className="w-full p-3 rounded-lg bg-neutral-600" placeholder="Enter Name" value={paymentform.name} name='name' />
                                <input onChange={handleChange} type="text" className="w-full p-3 rounded-lg bg-neutral-600" placeholder="Enter Message" value={paymentform.message} name='message' />
                                <input onChange={handleChange} type="number" className="w-full p-3 rounded-lg bg-neutral-600" placeholder="Enter Amount" value={paymentform.amount} name='amount' />
                                <button type="button" onClick={() => pay(paymentform.amount)} className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-3 text-center me-2 mb-2 disabled:from-slate-300 disabled:to-neutral-600 w-full" disabled={paymentform.name?.length < 3 || paymentform.message?.length < 4 || paymentform.amount?.length < 1}>Pay</button>
                            </div>
                            <div className="flex gap-2 mt-5 flex-col md:flex-row">
                                <button className="bg-neutral-800 border-2 border-lime-400 p-3 rounded-lg hover:bg-lime-500" onClick={() => pay(10)}>Pay $10</button>
                                <button className="bg-neutral-800 border-2 border-yellow-400 p-3 rounded-lg hover:bg-yellow-500" onClick={() => pay(20)}>Pay $20</button>
                                <button className="bg-neutral-800 border-2 border-blue-300 p-3 rounded-lg hover:bg-blue-400" onClick={() => pay(30)}>Pay $30</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'works' && (
                    <div className="works w-[80%] mt-11 bg-neutral-800 rounded-lg p-10">

                        <div className="space-y-4">
                            <Gallery data={currentUser}/>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default PaymentPage;