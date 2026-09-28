"use strict";

// Shared behaviour for TulusSG digital name cards.
// Each card page defines window.CARD before loading this script.

const CARD = window.CARD;

let lastModalTrigger = null;
let toastTimer = null;

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function displayUrl(url) {
  return String(url).replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

function applyCardUrl() {
  $$("[data-card-url]").forEach((link) => {
    link.href = CARD.cardUrl;
    link.textContent = displayUrl(CARD.cardUrl);
  });
}

function showToast(message) {
  const toast = $("[data-toast]");
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 1800);
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const input = document.createElement("input");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  showToast(successMessage);
}

async function shareCard() {
  const data = {
    title: `${CARD.name} | TulusSG`,
    text: `${CARD.name}, ${CARD.title} at TulusSG`,
    url: CARD.cardUrl,
  };
  if (navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch (error) {
      if (error && error.name === "AbortError") return;
    }
  }
  copyText(CARD.cardUrl, "Link copied");
}

function escapeVCard(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildVCard() {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCard(CARD.familyName)};${escapeVCard(CARD.givenName)};;;`,
    `FN:${escapeVCard(CARD.name)}`,
    `ORG:${escapeVCard(CARD.company)}`,
    `TITLE:${escapeVCard(CARD.title)}`,
  ];
  if (CARD.phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(CARD.phone)}`);
  if (CARD.email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(CARD.email)}`);
  (CARD.vcardLinks || []).forEach(([label, url], index) => {
    lines.push(`item${index + 1}.URL:${escapeVCard(url)}`);
    lines.push(`item${index + 1}.X-ABLabel:${escapeVCard(label)}`);
  });
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function downloadVCard() {
  const blob = new Blob([buildVCard()], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = CARD.vcardFile;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Contact saved");
}

function openModal(modal, trigger) {
  if (!modal) return;
  lastModalTrigger = trigger instanceof HTMLElement ? trigger : null;
  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    modal.setAttribute("open", "");
  }
  modal.querySelector("button, a, [tabindex]:not([tabindex='-1'])")?.focus();
}

function closeModal(modal) {
  if (!modal) return;
  if (typeof modal.close === "function") {
    modal.close();
  } else {
    modal.removeAttribute("open");
    restoreFocus();
  }
}

function restoreFocus() {
  if (lastModalTrigger instanceof HTMLElement) {
    lastModalTrigger.focus();
  }
}

function bindModal() {
  const modal = $("[data-qr-modal]");
  $("[data-open-qr]")?.addEventListener("click", (event) => openModal(modal, event.currentTarget));
  $("[data-close-qr]")?.addEventListener("click", () => closeModal(modal));
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal);
  });
  modal?.addEventListener("close", restoreFocus);
}

function init() {
  applyCardUrl();
  $("[data-save-contact]")?.addEventListener("click", downloadVCard);
  $$("[data-share]").forEach((button) => button.addEventListener("click", shareCard));
  $("[data-modal-copy-link]")?.addEventListener("click", () => copyText(CARD.cardUrl, "Link copied"));
  bindModal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
