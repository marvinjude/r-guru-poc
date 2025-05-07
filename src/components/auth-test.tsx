"use client"

import { useState } from "react"
import { useAuth } from "@/app/auth-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function AuthTest() {
  const { customerId, customerName, setCustomerName } = useAuth()
  const [nameInput, setNameInput] = useState("")

  const handleUpdateName = () => {
    if (nameInput.trim()) {
      setCustomerName(nameInput.trim())
      setNameInput("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Customer</CardTitle>
        <CardDescription>
          This customer id and name will be used to connect external apps and
          run integrations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="font-mono text-sm text-muted-foreground">
            Customer ID: {customerId || "Loading..."}
          </p>
          <p className="text-sm">
            Name: <span className="font-medium">{customerName || "Not set"}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter customer name"
          />
          <Button onClick={handleUpdateName}>
            Update Name
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
