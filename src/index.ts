#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = "https://api.appconnector.pro";

function getApiKey(): string {
  const key = process.env.GROWTHTOOLKIT_API_KEY;
  if (!key) {
    throw new Error(
      "GROWTHTOOLKIT_API_KEY environment variable is required. " +
        "Get your API key at https://enrich.growthtoolkit.io/api-keys/"
    );
  }
  return key;
}

async function apiRequest(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, unknown>
): Promise<{ data: unknown; isError: boolean }> {
  const apiKey = getApiKey();
  const separator = path.includes("?") ? "&" : "?";
  const url = `${BASE_URL}${path}${separator}api_key=${apiKey}`;

  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body && method === "POST") {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    const data = await res.json();

    const response = data as Record<string, unknown>;
    const isError =
      response.success === false || (res.status >= 400 && res.status !== 429);

    return { data, isError };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    return {
      data: { success: false, error: message },
      isError: true,
    };
  }
}

function toolResult(response: { data: unknown; isError: boolean }) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(response.data, null, 2) }],
    isError: response.isError,
  };
}

// --- Server setup ---

const server = new McpServer({
  name: "growthtoolkit",
  version: "1.0.0",
});

// ==================== ENRICHMENT TOOLS ====================

server.tool(
  "enrich_email",
  "Enrich a contact by email address. Returns detailed profile including name, job title, company, social profiles, and more. This is async — use check_task with the returned task_id to get results.",
  {
    email: z.string().email().describe("Email address to enrich"),
    list_id: z
      .number()
      .optional()
      .describe("List ID to save results to. If omitted, uses default list"),
    webhook_url: z
      .string()
      .url()
      .optional()
      .describe("Webhook URL to receive results when enrichment completes"),
  },
  async ({ email, list_id, webhook_url }) => {
    let path = `/enrichment/email/?email=${encodeURIComponent(email)}`;
    if (list_id !== undefined) path += `&list_id=${list_id}`;
    if (webhook_url) path += `&webhook_url=${encodeURIComponent(webhook_url)}`;
    const result = await apiRequest(path);
    return toolResult(result);
  }
);

server.tool(
  "enrich_linkedin",
  "Enrich a contact by LinkedIn profile URL. Returns emails, phone numbers, job title, company, experience, education, skills, and more. Set emails=1 and phones=1 to unlock contact info.",
  {
    linkedin_url: z
      .string()
      .describe(
        "LinkedIn profile URL (e.g. https://linkedin.com/in/username)"
      ),
    emails: z
      .number()
      .min(0)
      .max(1)
      .default(1)
      .describe("1 to unlock emails, 0 to skip. Default: 1"),
    phones: z
      .number()
      .min(0)
      .max(1)
      .default(1)
      .describe("1 to unlock phone numbers, 0 to skip. Default: 1"),
    list_id: z
      .number()
      .optional()
      .describe("List ID to save results to"),
    webhook_url: z
      .string()
      .url()
      .optional()
      .describe("Webhook URL to receive results when enrichment completes"),
  },
  async ({ linkedin_url, emails, phones, list_id, webhook_url }) => {
    const body: Record<string, unknown> = { url: linkedin_url, emails, phones };
    if (list_id !== undefined) body.list_id = list_id;
    if (webhook_url) body.webhook_url = webhook_url;
    const result = await apiRequest("/enrichment/linkedin/", "POST", body);
    return toolResult(result);
  }
);

server.tool(
  "enrich_phone",
  "Enrich a contact by phone number. Returns detailed profile including name, job title, company, and social profiles.",
  {
    phone_number: z
      .string()
      .describe("Phone number to enrich (include country code, e.g. +14155551234)"),
    list_id: z
      .number()
      .describe("List ID to save results to (required)"),
    webhook_url: z
      .string()
      .url()
      .optional()
      .describe("Webhook URL to receive results when enrichment completes"),
  },
  async ({ phone_number, list_id, webhook_url }) => {
    let path = `/enrichment/phone/?phone_number=${encodeURIComponent(phone_number)}&list_id=${list_id}`;
    if (webhook_url) path += `&webhook_url=${encodeURIComponent(webhook_url)}`;
    const result = await apiRequest(path);
    return toolResult(result);
  }
);

server.tool(
  "enrich_domain",
  "Enrich a company by its domain name. Returns company details including size, industry, location, social profiles, and more.",
  {
    domain: z.string().describe("Company domain to enrich (e.g. stripe.com)"),
    list_id: z
      .number()
      .optional()
      .describe("List ID to save results to"),
    webhook_url: z
      .string()
      .url()
      .optional()
      .describe("Webhook URL to receive results when enrichment completes"),
  },
  async ({ domain, list_id, webhook_url }) => {
    let path = `/enrichment/domain/?domain=${encodeURIComponent(domain)}`;
    if (list_id !== undefined) path += `&list_id=${list_id}`;
    if (webhook_url) path += `&webhook_url=${encodeURIComponent(webhook_url)}`;
    const result = await apiRequest(path);
    return toolResult(result);
  }
);

// ==================== EMAIL TOOLS ====================

server.tool(
  "find_email",
  "Find someone's email address given their first name, last name, and company domain.",
  {
    first_name: z.string().describe("First name of the person"),
    last_name: z.string().describe("Last name of the person"),
    domain: z.string().describe("Company domain (e.g. google.com)"),
    list_id: z
      .number()
      .optional()
      .describe("List ID to save results to. If omitted, uses default list"),
  },
  async ({ first_name, last_name, domain, list_id }) => {
    let path = `/email-finder/?first_name=${encodeURIComponent(first_name)}&last_name=${encodeURIComponent(last_name)}&domain=${encodeURIComponent(domain)}`;
    if (list_id !== undefined) path += `&list_id=${list_id}`;
    const result = await apiRequest(path);
    return toolResult(result);
  }
);

server.tool(
  "verify_email",
  "Verify if an email address is valid and deliverable. Returns validity status, MX domain, and email account type.",
  {
    email: z.string().email().describe("Email address to verify"),
    list_id: z
      .number()
      .optional()
      .describe("List ID to save results to. If omitted, uses default list"),
  },
  async ({ email, list_id }) => {
    let path = `/email-verifier/?email=${encodeURIComponent(email)}`;
    if (list_id !== undefined) path += `&list_id=${list_id}`;
    const result = await apiRequest(path);
    return toolResult(result);
  }
);

// ==================== TASK STATUS ====================

server.tool(
  "check_task",
  "Check the status of an async enrichment task. Use this after enrich_email returns a task_id. Returns full enriched data when the task is finished.",
  {
    task_id: z.string().describe("Task ID returned by an enrichment call"),
  },
  async ({ task_id }) => {
    const result = await apiRequest(`/tasks/status/${encodeURIComponent(task_id)}/`);
    return toolResult(result);
  }
);

// ==================== LIST TOOLS ====================

server.tool(
  "list_prospects",
  "Get all prospect/contact lists in your account.",
  {
    page: z.number().default(1).describe("Page number (default: 1)"),
    page_size: z.number().default(20).describe("Results per page (default: 20)"),
    q: z.string().optional().describe("Search query to filter lists by name"),
    detailed: z.number().min(0).max(1).optional().describe("1 for detailed info, 0 for basic"),
  },
  async ({ page, page_size, q, detailed }) => {
    let path = `/lists/prospect/?page=${page}&page_size=${page_size}`;
    if (q) path += `&q=${encodeURIComponent(q)}`;
    if (detailed !== undefined) path += `&detailed=${detailed}`;
    const result = await apiRequest(path);
    return toolResult(result);
  }
);

server.tool(
  "list_email_finder",
  "Get all email finder lists in your account.",
  {
    page: z.number().default(1).describe("Page number (default: 1)"),
    page_size: z.number().default(20).describe("Results per page (default: 20)"),
    q: z.string().optional().describe("Search query to filter lists by name"),
    detailed: z.number().min(0).max(1).optional().describe("1 for detailed info, 0 for basic"),
  },
  async ({ page, page_size, q, detailed }) => {
    let path = `/email-finder/list/?page=${page}&page_size=${page_size}`;
    if (q) path += `&q=${encodeURIComponent(q)}`;
    if (detailed !== undefined) path += `&detailed=${detailed}`;
    const result = await apiRequest(path);
    return toolResult(result);
  }
);

server.tool(
  "list_email_verifier",
  "Get all email verifier lists in your account.",
  {
    page: z.number().default(1).describe("Page number (default: 1)"),
    page_size: z.number().default(20).describe("Results per page (default: 20)"),
    q: z.string().optional().describe("Search query to filter lists by name"),
    detailed: z.number().min(0).max(1).optional().describe("1 for detailed info, 0 for basic"),
  },
  async ({ page, page_size, q, detailed }) => {
    let path = `/email-verifier/list/?page=${page}&page_size=${page_size}`;
    if (q) path += `&q=${encodeURIComponent(q)}`;
    if (detailed !== undefined) path += `&detailed=${detailed}`;
    const result = await apiRequest(path);
    return toolResult(result);
  }
);

server.tool(
  "list_linkedin_scraper",
  "Get all LinkedIn scraper lists in your account.",
  {
    page: z.number().default(1).describe("Page number (default: 1)"),
    page_size: z.number().default(20).describe("Results per page (default: 20)"),
    q: z.string().optional().describe("Search query to filter lists by name"),
    detailed: z.number().min(0).max(1).optional().describe("1 for detailed info, 0 for basic"),
  },
  async ({ page, page_size, q, detailed }) => {
    let path = `/scraper/list/ln/?page=${page}&page_size=${page_size}`;
    if (q) path += `&q=${encodeURIComponent(q)}`;
    if (detailed !== undefined) path += `&detailed=${detailed}`;
    const result = await apiRequest(path);
    return toolResult(result);
  }
);

server.tool(
  "list_sales_navigator_scraper",
  "Get all Sales Navigator scraper lists in your account.",
  {
    page: z.number().default(1).describe("Page number (default: 1)"),
    page_size: z.number().default(20).describe("Results per page (default: 20)"),
    q: z.string().optional().describe("Search query to filter lists by name"),
    detailed: z.number().min(0).max(1).optional().describe("1 for detailed info, 0 for basic"),
  },
  async ({ page, page_size, q, detailed }) => {
    let path = `/scraper/list/sn/?page=${page}&page_size=${page_size}`;
    if (q) path += `&q=${encodeURIComponent(q)}`;
    if (detailed !== undefined) path += `&detailed=${detailed}`;
    const result = await apiRequest(path);
    return toolResult(result);
  }
);

// ==================== EXPORT TOOLS ====================

server.tool(
  "export_prospects",
  "Export enriched contact data from a prospect list. Returns paginated contact records with full enrichment data.",
  {
    list_id: z.number().describe("Prospect list ID to export"),
    page: z.number().default(1).describe("Page number (default: 1)"),
  },
  async ({ list_id, page }) => {
    const result = await apiRequest(`/lists/prospect/export/${list_id}/?page=${page}`);
    return toolResult(result);
  }
);

server.tool(
  "export_email_finder",
  "Export results from an email finder list.",
  {
    list_id: z.number().describe("Email finder list ID to export"),
    page: z.number().default(1).describe("Page number (default: 1)"),
  },
  async ({ list_id, page }) => {
    const result = await apiRequest(`/email-finder/list/${list_id}/export/?page=${page}`);
    return toolResult(result);
  }
);

server.tool(
  "export_email_verifier",
  "Export results from an email verifier list. Can filter by validity.",
  {
    list_id: z.number().describe("Email verifier list ID to export"),
    page: z.number().default(1).describe("Page number (default: 1)"),
    type_: z
      .enum(["valid", "invalid", "all"])
      .default("all")
      .describe("Filter by email validity: valid, invalid, or all"),
  },
  async ({ list_id, page, type_ }) => {
    const result = await apiRequest(`/email-verifier/list/${list_id}/export/?page=${page}&type_=${type_}`);
    return toolResult(result);
  }
);

server.tool(
  "export_linkedin_scraper",
  "Export results from a LinkedIn scraper list.",
  {
    list_id: z.number().describe("LinkedIn scraper list ID to export"),
    page: z.number().default(1).describe("Page number (default: 1)"),
    type: z
      .enum(["search", "profile"])
      .default("search")
      .describe("Export type: search or profile"),
  },
  async ({ list_id, page, type }) => {
    const result = await apiRequest(`/scraper/ln/${list_id}/export/?page=${page}&type=${type}`);
    return toolResult(result);
  }
);

server.tool(
  "export_sales_navigator_scraper",
  "Export results from a Sales Navigator scraper list.",
  {
    list_id: z.number().describe("Sales Navigator scraper list ID to export"),
    page: z.number().default(1).describe("Page number (default: 1)"),
  },
  async ({ list_id, page }) => {
    const result = await apiRequest(`/scraper/sn/${list_id}/export/?page=${page}`);
    return toolResult(result);
  }
);

// --- Start server ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GrowthToolkit MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
