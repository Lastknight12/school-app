"use client";

import { GoArrowDownLeft } from "react-icons/go";
import { GoArrowUpRight } from "react-icons/go";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shadcn/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/shadcn/ui/tabs";

interface Props {
  statsData: {
    incoming: {
      amount: string;
      count: number | undefined;
    };
    outgoing: {
      amount: string;
      count: number | undefined;
    };
  };
}

export default function StatsInfo({ statsData }: Props) {
  return (
    <Tabs defaultValue="account" className="mx-auto mt-3 px-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Витрати</TabsTrigger>
        <TabsTrigger value="password">Надходження</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex w-max items-center justify-center rounded-full bg-orange-600 p-2">
                <GoArrowUpRight />
              </div>
            </CardTitle>
            <CardDescription className="!mt-3">Витрати</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="mb-2 space-y-1 text-2xl">
              -{statsData.outgoing.amount}$
            </div>
            <div className="space-y-1 rounded-lg border border-border bg-secondary px-5 py-2">
              🤝 усього ви зробили {statsData.outgoing.count} транзакцій
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex w-max items-center justify-center rounded-full bg-green-500 p-2">
                <GoArrowDownLeft />
              </div>
            </CardTitle>
            <CardDescription className="!mt-3">Надходження</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="mb-2 space-y-1 text-2xl">
              +{statsData.incoming.amount}$
            </div>
            <div className="space-y-1 rounded-lg border border-border bg-secondary px-5 py-2">
              👍 усього зроблено {statsData.incoming.count} транзакцій
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
