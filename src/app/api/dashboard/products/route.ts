import { ZodError } from "zod";
import { AppError } from "../../../../core/http/errors";
import { fail, ok } from "../../../../core/http/responses";
import { API_ERROR_CODES } from "../../../../lib/constants";
import { readSearchQuery } from "../../../../core/search/search-query";
import { getDashboardAuth } from "../../../../modules/auth/dashboard-auth.service";
import {
  createProduct,
  findProductsPaginated,
  normalizeProductActivityFilter,
} from "../../../../modules/products/product.service";

function statusForErrorCode(code: string) {
  if (code === API_ERROR_CODES.CONFLICT) {
    return 409;
  }

  if (code === API_ERROR_CODES.INVALID_INPUT) {
    return 400;
  }

  return 500;
}

function errorResponse(error: unknown) {
  if (error instanceof ZodError || error instanceof SyntaxError) {
    return Response.json(fail(API_ERROR_CODES.INVALID_INPUT, "Invalid request body"), { status: 400 });
  }

  if (error instanceof AppError) {
    return Response.json(fail(error.code, error.message), { status: statusForErrorCode(error.code) });
  }

  return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
}

async function requireDashboardSession() {
  const auth = await getDashboardAuth();
  if (!auth.isAuthenticated) {
    return Response.json(fail(API_ERROR_CODES.UNAUTHORIZED, "Dashboard authentication is required"), {
      status: 401,
    });
  }
  return null;
}

export async function GET(request: Request) {
  const unauthorized = await requireDashboardSession();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const url = new URL(request.url);
    const query = readSearchQuery(url.searchParams);
    const sort = url.searchParams.get("sort") || undefined;
    const activityFilter = normalizeProductActivityFilter(url.searchParams.get("activity"));
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") || "20", 10)));

    const result = await findProductsPaginated({
      query,
      activityFilter,
      sort,
      page,
      pageSize,
    });

    return Response.json(ok({
      items: result.items.map((product) => ({
        ...product,
        defaultImage: null,
        imageCount: 0,
      })),
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    }));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireDashboardSession();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const input = await request.json();
    const product = await createProduct(input);
    return Response.json(ok(product));
  } catch (error) {
    return errorResponse(error);
  }
}
