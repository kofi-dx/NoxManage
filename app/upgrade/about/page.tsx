"use client";

import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp, CreditCard } from "lucide-react";
import Container from "@/components/container";
import Image from 'next/image'

const AboutPage = () => {
  return (
    <Container className="px-4 md:px-12 py-12">
      {/** Subscription Page Header */}
      <section className="flex flex-col items-center justify-center text-center my-12">
        <h1 className="text-5xl font-bold tracking-wider uppercase text-neutral-700 my-4">
          About Subscriptions
        </h1>
        <p className="w-full text-neutral-500 md:w-[720px] text-base">
          Upgrade your experience with our tailored subscription plans, designed
          to give you more control, features, and value.
        </p>
      </section>

      {/** Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
        <Card className="shadow-lg rounded-md border-none p-8 flex flex-col items-center text-center">
          <CheckCircle className="w-8 h-8 text-hero" />
          <CardTitle className="text-neutral-600">Premium Features</CardTitle>
          <CardDescription className="text-base text-neutral-500">
            Unlock advanced features like priority support, enhanced analytics,
            and more customization options for your store.
          </CardDescription>
        </Card>
        <Card className="shadow-lg rounded-md border-none p-8 flex flex-col items-center text-center">
          <TrendingUp className="w-8 h-8 text-hero" />
          <CardTitle className="text-neutral-600">Boost Sales</CardTitle>
          <CardDescription className="text-base text-neutral-500">
            With premium tools, you can elevate your store&apos;s performance and
            reach new customers faster than ever.
          </CardDescription>
        </Card>
        <Card className="shadow-lg rounded-md border-none p-8 flex flex-col items-center text-center">
          <CreditCard className="w-8 h-8 text-hero" />
          <CardTitle className="text-neutral-600">Flexible Pricing</CardTitle>
          <CardDescription className="text-base text-neutral-500">
            Choose from flexible subscription plans that fit your budget and
            scale with your business.
          </CardDescription>
        </Card>
      </section>

      {/** Subscription Features Section */}
      <section className="my-12">
        <h2 className="text-4xl font-bold tracking-wider uppercase text-neutral-700 my-4 text-center">
          Subscription Features
        </h2>
        <p className="text-base text-center text-neutral-500 my-4">
          Get access to exclusive features that help you stand out and grow.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-8">
          {/* Replace with your actual feature data */}
          {[ 
            { id: 1, name: "Advanced Analytics", iconUrl: "/icons/analytics.svg" }, 
            { id: 2, name: "Priority Support", iconUrl: "/icons/support.svg" },  
            { id: 3, name: "Custom Themes", iconUrl: "/icons/theme.svg" }, 
            { id: 4, name: "Dedicated Account Manager", iconUrl: "/icons/manager.svg" }
          ].map((feature) => (
            <Card
              key={feature.id}
              className="shadow-md rounded-md p-4 flex flex-col items-center justify-center text-center"
            >
              <Image
                alt={feature.name}
                className="w-16 h-16 mb-4"
                src={""}
              />
              <CardTitle className="text-neutral-600">{feature.name}</CardTitle>
            </Card>
          ))}
        </div>
      </section>

      {/** Commitment to Subscribers */}
      <section className="text-center my-12 py-8 bg-gray-50 rounded-md">
        <h2 className="text-4xl font-bold tracking-wider uppercase text-neutral-700 my-4">
          Why Subscribe?
        </h2>
        <p className="text-base text-neutral-500 md:w-[720px] mx-auto">
          Subscribing to our plans gives you access to exclusive tools, better
          support, and features that enhance your business.
        </p>
        <div className="my-8 flex justify-center gap-4">
          <Button
            className="px-8 py-4 rounded-full bg-neutral-600"
            onClick={() => window.location.href = "/upgrade"}
          >
            View Plans
          </Button>
          
        </div>
            {/** Additional Information Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 border border-gray-200 rounded-md shadow-md">
                <h3 className="text-lg font-semibold text-neutral-700">Our Address</h3>
                <p className="text-base text-neutral-500 mt-2">
                123 Sneaker Lane, Accra, Ghana
                </p>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-md shadow-md">
                <h3 className="text-lg font-semibold text-neutral-700">Customer Support</h3>
                <p className="text-base text-neutral-500 mt-2">support@sneakers.com</p>
                <p className="text-base text-neutral-500">+233 123 456 789</p>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-md shadow-md">
                <h3 className="text-lg font-semibold text-neutral-700">Follow Us</h3>
                <p className="text-base text-neutral-500 mt-2">
                
                Facebook
                | 
                <span className="text-white bg-gradient-to-r from-pink-600 to-transparent px-2 py-1 rounded-md">
                    Instagram
                </span>{" "}
                |
                <span className="text-white bg-blue-600 px-2 py-1 rounded-md">Twitter/X</span>{" "}
                </p>
            </div>
        </section>
      </section>
          
      
      
    </Container>
  );
};

export default AboutPage;
