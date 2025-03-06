"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/shadcn/ui/card";
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
  onTabChange: (tab: "incoming" | "outgoing") => void;
}

export default function StatsInfo({ statsData, onTabChange }: Props) {
  return (
    <Tabs defaultValue="account" className="mx-auto mt-3 px-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account" onClick={() => onTabChange("outgoing")}>
          Витрати
        </TabsTrigger>
        <TabsTrigger value="password" onClick={() => onTabChange("incoming")}>
          Надходження
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 rounded-full mr-2 bg-red-100">
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                  </div>

                  <p className="text-base font-normal">Витрати</p>
                </div>

                <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                  -{statsData.outgoing.amount} ₴
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 rounded-full mr-2 bg-green-100">
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  </div>

                  <p className="text-base font-normal">Надходження</p>
                </div>

                <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                  +{statsData.incoming.amount} ₴
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 rounded-lg border border-border bg-secondary px-5 py-2">
              👍 усього зроблено {statsData.incoming.count} транзакцій
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
