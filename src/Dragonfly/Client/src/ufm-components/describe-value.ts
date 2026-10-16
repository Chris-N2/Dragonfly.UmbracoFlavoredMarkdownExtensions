import { UmbId } from "@umbraco-cms/backoffice/id";
import { UMB_MEDIA_ENTITY_TYPE } from "@umbraco-cms/backoffice/media";
import type { UfmItemNameResolver } from "./item-name-resolver.js";
import { parseLegacyUdi, parseLinkValues, withQueryString } from "./link-value.function.js";
import type { UfmLinkValue } from "./link-value.function.js";

type PickedItem = {
  type?: string;
  unique: string;
};

const htmlTagPattern = /<\/?[a-z][^>]*>/i;

/**
 * Describes a link the way AngularJS labels did: the linked item's name when one is picked,
 * otherwise the link title, otherwise the URL with its query string or anchor.
 */
export async function describeLink(link: UfmLinkValue, itemNames: UfmItemNameResolver): Promise<string> {
  const itemName = link?.unique ? await itemNames.names(link.type, [link.unique]) : undefined;

  return itemName || link?.name || withQueryString(link, link?.url) || "";
}

/**
 * Describes a property value by its shape: a link picker shows each link's description, a content,
 * media or multinode tree picker shows the picked items' names, rich text has its HTML stripped, a
 * list of text is comma-separated, and plain text is shown as it is.
 */
export async function describeValue(value: unknown, itemNames: UfmItemNameResolver): Promise<string | undefined> {
  const links = linksIn(value);
  if (links.length) {
    const descriptions = await Promise.all(links.map((link) => describeLink(link, itemNames)));
    return descriptions.filter((description) => description).join(", ");
  }

  const pickedItems = parsePickedItems(value);
  if (pickedItems.length) {
    return itemNames.names(
      pickedItems[0].type,
      pickedItems.map((item) => item.unique),
    );
  }

  // Rich text arrives as { markup, blocks }; an empty editor still sends the object, with empty markup.
  if (value && typeof value === "object" && "markup" in value) {
    return stripHtml(String(value.markup ?? ""));
  }

  if (typeof value === "string") {
    return htmlTagPattern.test(value) ? stripHtml(value) : value.trim();
  }

  // Lists of text, such as tags or a Contentment Data List, show their items comma-separated.
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string" && item.trim() !== "")
      .join(", ");
  }

  // Zero was falsy in the AngularJS fallbacks, so it is skipped here too.
  if (typeof value === "number" && value !== 0) {
    return String(value);
  }

  return undefined;
}

/**
 * Reads a link picker value into its links. Picked-item values hold only a key and type, so a value
 * is only treated as links when every item carries a name, URL or query string.
 */
export function linksIn(value: unknown): Array<UfmLinkValue> {
  if (!value || typeof value !== "object") return [];

  const links = parseLinkValues(value);

  return links.length && links.every((link) => link.name || link.url || link.queryString) ? links : [];
}

/**
 * Reads a content, media or multinode tree picker value into the items it picks. Anything else
 * returns no items, so it is rendered as text instead.
 */
function parsePickedItems(value: unknown): Array<PickedItem> {
  const items = typeof value === "string" ? value.split(",") : Array.isArray(value) ? value : [];

  const pickedItems = items.map(toPickedItem);

  return pickedItems.length && pickedItems.every((item) => item) ? (pickedItems as Array<PickedItem>) : [];
}

function toPickedItem(item: unknown): PickedItem | undefined {
  if (typeof item === "string") {
    const key = item.trim();
    return UmbId.validate(key) ? { unique: key } : parseLegacyUdi(key);
  }

  if (!item || typeof item !== "object") return undefined;

  // Media Picker values hold the picked media's key in mediaKey; other pickers use unique and type.
  const { mediaKey, unique, type } = item as { mediaKey?: string; unique?: string; type?: string };

  if (mediaKey) return { type: UMB_MEDIA_ENTITY_TYPE, unique: mediaKey };
  if (unique) return { type, unique };

  return undefined;
}

function stripHtml(markup: string): string {
  const document = new DOMParser().parseFromString(markup, "text/html");

  return (document.body.textContent ?? "").trim();
}
