import React from "react";
import { useParams } from "react-router-dom";

function JobDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Job Detail</h1>
      <p className="text-muted-foreground">Job ID: {id}</p>
      <p className="text-muted-foreground">
        This page will show detailed job information and allow users to apply.
      </p>
    </div>
  );
}

export default JobDetail;
