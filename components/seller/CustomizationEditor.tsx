"use client";

import { useState } from "react";
import { Plus, Trash2, Image as ImageIcon, X, DollarSign, GripVertical } from "lucide-react";
import { uploadProductImage } from "@/lib/uploadProductImage";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

export interface CustomizationOptionInput {
  id: string;
  name: string;
  priceModifier: string;
  imageUrl: string;
  file?: File;
  uploading?: boolean;
}

export interface CustomizationGroupInput {
  id: string;
  name: string;
  options: CustomizationOptionInput[];
}

interface Props {
  groups: CustomizationGroupInput[];
  onChange: (groups: CustomizationGroupInput[]) => void;
  userId: string;
}

export function CustomizationEditor({ groups, onChange, userId }: Props) {
  const addGroup = () => {
    const newGroup: CustomizationGroupInput = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      options: [{ id: Math.random().toString(36).substr(2, 9), name: "", priceModifier: "", imageUrl: "" }],
    };
    onChange([...groups, newGroup]);
  };

  const removeGroup = (groupId: string) => {
    onChange(groups.filter((g) => g.id !== groupId));
  };

  const updateGroup = (groupId: string, name: string) => {
    onChange(groups.map((g) => (g.id === groupId ? { ...g, name } : g)));
  };

  const addOption = (groupId: string) => {
    onChange(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: [
                ...g.options,
                { id: Math.random().toString(36).substr(2, 9), name: "", priceModifier: "", imageUrl: "" },
              ],
            }
          : g
      )
    );
  };

  const removeOption = (groupId: string, optionId: string) => {
    onChange(
      groups.map((g) =>
        g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== optionId) } : g
      )
    );
  };

  const updateOption = (groupId: string, optionId: string, updates: Partial<CustomizationOptionInput>) => {
    onChange(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: g.options.map((o) => (o.id === optionId ? { ...o, ...updates } : o)),
            }
          : g
      )
    );
  };

  const handleImageUpload = async (groupId: string, optionId: string, file: File) => {
    updateOption(groupId, optionId, { uploading: true });
    try {
      const url = await uploadProductImage(file, userId, Math.floor(Math.random() * 1000));
      updateOption(groupId, optionId, { imageUrl: url, uploading: false });
    } catch (err) {
      console.error("Image upload failed", err);
      updateOption(groupId, optionId, { uploading: false });
    }
  };

  return (
    <div className="space-y-6">
      {groups.map((group, groupIdx) => (
        <div key={group.id} className="rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white shadow-sm" style={{ backgroundColor: PURPLE }}>
                {groupIdx + 1}
              </span>
              <input
                type="text"
                value={group.name}
                onChange={(e) => updateGroup(group.id, e.target.value)}
                placeholder="e.g., Windows, Door Type, Interior Color"
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#4B1D8F]"
              />
            </div>
            <button
              type="button"
              onClick={() => removeGroup(group.id)}
              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.options.map((option) => (
              <div key={option.id} className="group relative rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-all hover:border-purple-200 hover:bg-white hover:shadow-md">
                <button
                  type="button"
                  onClick={() => removeOption(group.id, option.id)}
                  className="absolute -right-2 -top-2 z-10 hidden rounded-full bg-white p-1.5 text-gray-400 shadow-md hover:text-red-500 group-hover:block"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                <div className="mb-3 aspect-square relative w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-white">
                  {option.imageUrl ? (
                    <>
                      <img src={option.imageUrl} alt={option.name} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <label className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-gray-900 shadow-lg">
                          Change
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(group.id, option.id, file);
                            }}
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 p-4 transition-colors hover:bg-purple-50/30">
                      <div className="rounded-full bg-gray-50 p-2 text-gray-400">
                        {option.uploading ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                        ) : (
                          <ImageIcon className="h-5 w-5" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">Add Option Image</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(group.id, option.id, file);
                        }}
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={option.name}
                    onChange={(e) => updateOption(group.id, option.id, { name: e.target.value })}
                    placeholder="Option name (e.g., Door A60)"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4B1D8F]"
                  />
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">$</span>
                    <input
                      type="number"
                      value={option.priceModifier}
                      onChange={(e) => updateOption(group.id, option.id, { priceModifier: e.target.value })}
                      placeholder="Upcharge (e.g., 350)"
                      className="w-full rounded-lg border border-gray-200 bg-white pl-6 pr-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4B1D8F]"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addOption(group.id)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-100 bg-white p-4 transition-all hover:border-purple-200 hover:bg-purple-50/30"
            >
              <div className="rounded-full bg-purple-50 p-2 text-[#4B1D8F]">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-purple-700">Add Option</span>
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addGroup}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-6 transition-all hover:border-purple-300 hover:bg-purple-50/30 group"
      >
        <Plus className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
        <span className="text-sm font-bold text-gray-500 group-hover:text-purple-700">Add New Customization Category</span>
      </button>
    </div>
  );
}
