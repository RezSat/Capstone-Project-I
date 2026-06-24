export type AdjustStockInput = {
  variantId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  note?: string;
};

export type AdjustStockResponse = {
  success: boolean;
  data?: AdjustStockInput;
  error?: string;
};

export async function adjustStock(input: AdjustStockInput): Promise<AdjustStockResponse> {
  try {
    const response = await fetch("/api/dashboard/inventory/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorObj = result.error;
      const errorMessage = typeof errorObj === "object" && errorObj !== null && "message" in errorObj
        ? String(errorObj.message)
        : "Failed to adjust stock";
      return {
        success: false,
        error: errorMessage,
      };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error" };
  }
}