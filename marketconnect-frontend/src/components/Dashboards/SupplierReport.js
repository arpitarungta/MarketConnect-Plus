import React, { useEffect, useState } from "react";
import { get } from "../../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line
} from "recharts";

export default function SupplierReport() {
  const [data, setData] = useState(null);

  useEffect(() => {
  get("/reports/weekly", true)
    .then(res => {
      console.log("REPORT DATA:", res); // 🔥 ADD THIS
      setData(res);
    })
    .catch(err => {
      console.error("REPORT ERROR:", err);
    });
}, []);

  if (!data) return <p>No data / API failed</p>;

  const formattedOrders = data.orders.map(o => ({
  ...o,
  date: new Date(o.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  })
}));

  return (
    <div className="mc-card" style={{ padding: 20 }}>
      <h2>📊 Weekly Report</h2>
      <h4>Top Selling Items</h4>
      <BarChart width={600} height={300} data={data.items}>
        <XAxis dataKey="title" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="totalSold" fill="#6366f1" radius={[10, 10, 0, 0]} />
      </BarChart>

      <h4>Orders Per Day</h4>
      <LineChart width={600} height={300} data={formattedOrders}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="totalOrders" 
          stroke="#10b981" 
          strokeWidth={3}
          dot={{ r: 5 }}
        />
      </LineChart>
    </div>
  );
}