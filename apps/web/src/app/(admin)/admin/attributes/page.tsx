"use client";

import React, { useState, useEffect } from "react";
import {
  useAttributes,
  useCreateAttribute,
  useUpdateAttribute,
  useDeleteAttribute,
  useCreateAttributeValue,
  useUpdateAttributeValue,
  useDeleteAttributeValue,
} from "@/hooks/useAttributes";
import { type ProductAttribute, type AttributeValue } from "@/services/attribute.service";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";

// ─── Attribute Modal ───────────────────────────────────────────────────────────

interface AttrModalProps {
  isOpen: boolean;
  onClose: () => void;
  attribute?: ProductAttribute | null;
}

function AttributeModal({ isOpen, onClose, attribute }: AttrModalProps) {
  const isEditing = !!attribute;
  const createMutation = useCreateAttribute();
  const updateMutation = useUpdateAttribute();

  const [name, setName] = useState(attribute?.name ?? "");
  const [unit, setUnit] = useState(attribute?.unit ?? "");
  const [type, setType] = useState<"text" | "number" | "select">(attribute?.type ?? "text");
  const [isActive, setIsActive] = useState(attribute?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(attribute?.sortOrder ?? 0);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setFieldErrors({ name: "Name is required" }); return; }
    try {
      const payload = { name: name.trim(), unit: unit.trim() || undefined, type, isActive, sortOrder };
      if (isEditing && attribute) {
        await updateMutation.mutateAsync({ id: attribute.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      if (Array.isArray(err?.details) && err.details.length > 0) {
        const fields: Record<string, string> = {};
        err.details.forEach((d: { field: string; message: string }) => {
          if (d.field) fields[d.field] = d.message;
        });
        setFieldErrors(fields);
        setError("");
      } else {
        setError(err?.message || "Something went wrong");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
      <h2 className="mb-6 text-xl font-bold text-gray-800 dark:text-white/90">
        {isEditing ? "Edit Attribute" : "New Attribute"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Attribute Name <span className="text-error-500">*</span></Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Material, Size" />
          {fieldErrors.name && <p className="mt-1 text-xs text-error-500">{fieldErrors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Unit</Label>
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. ft, kg" />
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input
              type="number"
              value={String(sortOrder)}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <Label>Type</Label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "text" | "number" | "select")}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            <option value="text">Text — free-form input</option>
            <option value="number">Number — numeric input with unit</option>
            <option value="select">Select — dropdown from predefined values</option>
          </select>
          <p className="mt-1 text-[11px] text-gray-400">
            {type === "select" ? "You can add predefined values below after saving." : "Values are entered freely when adding specs to a product."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-500"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
            Active (visible in product form)
          </label>
        </div>

        {error && <p className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-500">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Value Row ─────────────────────────────────────────────────────────────────

interface ValueRowProps {
  attrId: string;
  val: AttributeValue;
}

function ValueRow({ attrId, val }: ValueRowProps) {
  const updateMutation = useUpdateAttributeValue();
  const deleteMutation = useDeleteAttributeValue();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(val.value);

  const save = async () => {
    if (!text.trim() || text === val.value) { setEditing(false); return; }
    await updateMutation.mutateAsync({ attributeId: attrId, valueId: val.id, data: { value: text.trim() } });
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
      {editing ? (
        <>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); save(); } if (e.key === 'Escape') setEditing(false); }}
            className="h-7 flex-1 rounded-lg border border-gray-200 px-2 py-0 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            autoFocus
          />
          <button onClick={save} disabled={updateMutation.isPending}
            className="rounded px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50">
            {updateMutation.isPending ? "…" : "Save"}
          </button>
          <button onClick={() => setEditing(false)}
            className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            Cancel
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{val.value}</span>
          <button onClick={() => setEditing(true)}
            className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors">
            Edit
          </button>
          <button
            onClick={() => deleteMutation.mutate({ attributeId: attrId, valueId: val.id })}
            disabled={deleteMutation.isPending}
            className="text-xs font-semibold text-error-500 hover:text-error-600 transition-colors"
          >
            {deleteMutation.isPending ? "…" : "Delete"}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Values Panel ──────────────────────────────────────────────────────────────

interface ValuesPanelProps {
  attribute: ProductAttribute;
}

function ValuesPanel({ attribute }: ValuesPanelProps) {
  const createMutation = useCreateAttributeValue();
  const [newValue, setNewValue] = useState("");
  const [addError, setAddError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) { setAddError("Value cannot be empty"); return; }
    try {
      await createMutation.mutateAsync({ attributeId: attribute.id, value: newValue.trim() });
      setNewValue("");
      setAddError("");
    } catch (err: any) {
      setAddError(err?.message || "Failed to add value");
    }
  };

  const values = attribute.values ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Values
          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {values.length}
          </span>
        </p>
        {attribute.type !== "select" && (
          <p className="text-[11px] text-gray-400">Values only apply to "Select" type</p>
        )}
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {values.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">
            {attribute.type === "select" ? "No values yet — add your first one below" : "Not applicable for this attribute type"}
          </p>
        ) : (
          values.map((v) => <ValueRow key={v.id} attrId={attribute.id} val={v} />)
        )}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={newValue}
          onChange={(e) => { setNewValue(e.target.value); setAddError(""); }}
          placeholder='e.g. "MS Steel", "PUF Panel"'
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Adding…" : "+ Add"}
        </Button>
      </form>
      {addError && <p className="text-xs text-error-500">{addError}</p>}
    </div>
  );
}

// ─── Attribute Row ─────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<string, string> = {
  text:   "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  number: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
  select: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400",
};

interface AttrRowProps {
  attribute: ProductAttribute;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function AttributeRow({ attribute, isSelected, onSelect, onEdit, onDelete, isDeleting }: AttrRowProps) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
        isSelected
          ? "border-brand-500 bg-brand-50 dark:bg-brand-500/5"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 dark:text-white/90 truncate">{attribute.name}</span>
            {attribute.unit && (
              <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {attribute.unit}
              </span>
            )}
            {!attribute.isActive && (
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400 dark:bg-gray-800">
                Inactive
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TYPE_BADGE[attribute.type] ?? ""}`}>
              {attribute.type}
            </span>
            {(attribute.values?.length ?? 0) > 0 && (
              <span className="text-[11px] text-gray-400">{attribute.values!.length} value{attribute.values!.length !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors">
            Edit
          </button>
          <button onClick={onDelete} disabled={isDeleting}
            className="text-xs font-semibold text-error-500 hover:text-error-600 transition-colors">
            {isDeleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AttributesPage() {
  const { data: attributes = [], isLoading, error } = useAttributes();
  const deleteMutation = useDeleteAttribute();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editAttr, setEditAttr] = useState<ProductAttribute | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductAttribute | null>(null);

  const openCreate = () => { setEditAttr(null); setModalOpen(true); };
  const openEdit = (a: ProductAttribute) => { setEditAttr(a); setModalOpen(true); };
  const closeModal = () => { setEditAttr(null); setModalOpen(false); };

  const selectedAttr = attributes.find((a) => a.id === selectedId) ?? null;

  // Auto-select first attribute on load - intentional initialization pattern
  useEffect(() => {
    if (!selectedId && attributes.length > 0) setSelectedId(attributes[0].id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [attributes, selectedId]);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        if (selectedId === deleteTarget.id) setSelectedId(attributes[0]?.id ?? null);
      },
    });
  };

  if (isLoading) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="animate-pulse text-lg font-medium text-gray-500">Loading attributes…</div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center">
      <p className="font-medium text-error-500">Error loading attributes. Check API connection.</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Attributes</h2>
          <p className="text-sm text-gray-500">
            {attributes.length} attribute{attributes.length !== 1 ? "s" : ""} — used in product specification forms
          </p>
        </div>
        <Button onClick={openCreate} size="sm">+ New Attribute</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Attribute list */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Attributes</p>
          {attributes.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <div className="text-center text-sm text-gray-400">
                <p className="font-medium">No attributes yet</p>
                <p className="text-xs mt-1">Click "+ New Attribute" to create one</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {attributes.map((attr) => (
                <AttributeRow
                  key={attr.id}
                  attribute={attr}
                  isSelected={selectedId === attr.id}
                  onSelect={() => setSelectedId(attr.id)}
                  onEdit={() => openEdit(attr)}
                  onDelete={() => setDeleteTarget(attr)}
                  isDeleting={deleteMutation.isPending && deleteTarget?.id === attr.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Values panel */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Values for: {selectedAttr?.name ?? "—"}
          </p>
          {selectedAttr ? (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <ValuesPanel attribute={selectedAttr} />
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 dark:border-gray-800">
              Select an attribute to manage its values
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Attribute Modal */}
      <AttributeModal key={editAttr?.id ?? 'new'} isOpen={isModalOpen} onClose={closeModal} attribute={editAttr} />

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} className="max-w-sm p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white/90">Delete Attribute</h3>
          <p className="mb-6 text-sm text-gray-500">
            Delete <span className="font-semibold text-gray-700 dark:text-white">{deleteTarget?.name}</span>?
            All associated values will also be deleted.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              className="flex-1 bg-error-600 hover:bg-error-700 border-none"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
