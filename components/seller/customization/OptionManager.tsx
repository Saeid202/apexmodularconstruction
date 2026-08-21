"use client";

import { useState, useRef } from "react";
import { Plus, X, Edit2, Upload, Image as ImageIcon, Package, DollarSign } from "lucide-react";
import { createCustomizationOption, updateCustomizationOption, deleteCustomizationOption } from "@/app/actions/customization";
import { uploadProductImage } from "@/lib/uploadProductImage";
import type { Database } from "@/types/database";

type CustomizationOption = Database['public']['Tables']['product_customization_options']['Row'];
type UpdateCustomizationOption = Database['public']['Tables']['product_customization_options']['Update'];

interface OptionManagerProps {
  categoryId: string;
  categoryName: string;
  options: CustomizationOption[];
  onOptionsChange: (options: CustomizationOption[]) => void;
  userId: string;
}

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

export function OptionManager({ categoryId, categoryName, options, onOptionsChange, userId }: OptionManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());
  
  // New option form state
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionDescription, setNewOptionDescription] = useState("");
  const [newOptionPrice, setNewOptionPrice] = useState("0");
  const [newOptionImages, setNewOptionImages] = useState<string[]>([]);
  const [newOptionStockQuantity, setNewOptionStockQuantity] = useState("");
  const [newOptionTrackInventory, setNewOptionTrackInventory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (files: FileList, optionId?: string) => {
    if (!files || files.length === 0) return;

    const imageUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadId = `${optionId || 'new'}-${Date.now()}-${i}`;
        
        setUploadingImages(prev => new Set(prev).add(uploadId));
        
        try {
          const url = await uploadProductImage(file, userId, Date.now());
          imageUrls.push(url);
        } catch (error) {
          console.error("Failed to upload image:", error);
        } finally {
          setUploadingImages(prev => {
            const newSet = new Set(prev);
            newSet.delete(uploadId);
            return newSet;
          });
        }
      }

      if (optionId) {
        // Update existing option
        const option = options.find(opt => opt.id === optionId);
        if (option) {
          const updatedImages = [...(option.additional_images || []), ...imageUrls];
          await updateCustomizationOption(optionId, { additional_images: updatedImages });
          onOptionsChange(options.map(opt => 
            opt.id === optionId 
              ? { ...opt, additional_images: updatedImages }
              : opt
          ));
        }
      } else {
        // Add to new option form
        setNewOptionImages(prev => [...prev, ...imageUrls]);
      }
    } catch (error) {
      console.error("Error in image upload process:", error);
    }
  };

  const handleAddOption = async () => {
    if (!newOptionName.trim()) return;

    try {
      const result = await createCustomizationOption({
        group_id: categoryId,
        name: newOptionName.trim(),
        description: newOptionDescription.trim() || null,
        price_modifier: parseFloat(newOptionPrice) || 0,
        image_url: newOptionImages[0] || null,
        additional_images: newOptionImages.length > 1 ? newOptionImages.slice(1) : null,
        stock_quantity: newOptionTrackInventory && newOptionStockQuantity ? parseInt(newOptionStockQuantity) : null,
        track_inventory: newOptionTrackInventory,
      });

      if (result.data) {
        onOptionsChange([...options, result.data]);
        // Reset form
        setNewOptionName("");
        setNewOptionDescription("");
        setNewOptionPrice("0");
        setNewOptionImages([]);
        setNewOptionStockQuantity("");
        setNewOptionTrackInventory(false);
        setIsAddingNew(false);
      } else {
        console.error("Failed to create option:", result.error);
      }
    } catch (error) {
      console.error("Error creating option:", error);
    }
  };

  const handleUpdateOption = async (id: string, updates: UpdateCustomizationOption) => {
    try {
      const result = await updateCustomizationOption(id, updates);
      if (result.data) {
        onOptionsChange(options.map(opt => opt.id === id ? result.data! : opt));
        setEditingId(null);
      } else {
        console.error("Failed to update option:", result.error);
      }
    } catch (error) {
      console.error("Error updating option:", error);
    }
  };

  const handleDeleteOption = async (id: string) => {
    if (!confirm("Are you sure you want to delete this option?")) return;

    try {
      const result = await deleteCustomizationOption(id);
      if (!result.error) {
        onOptionsChange(options.filter(opt => opt.id !== id));
      } else {
        console.error("Failed to delete option:", result.error);
      }
    } catch (error) {
      console.error("Error deleting option:", error);
    }
  };

  const removeImage = (optionId: string, imageIndex: number) => {
    if (optionId === 'new') {
      // Remove from new option form
      setNewOptionImages(prev => prev.filter((_, index) => index !== imageIndex));
    } else {
      // Remove from existing option
      const option = options.find(opt => opt.id === optionId);
      if (option && option.additional_images) {
        const updatedImages = option.additional_images.filter((_, index) => index !== imageIndex);
        handleUpdateOption(optionId, { additional_images: updatedImages });
      }
    }
  };

  const isNewOption = (option: CustomizationOption | { id: 'new', images: string[] }): option is { id: 'new', images: string[] } => {
  return option.id === 'new';
};

const renderOptionImages = (option: CustomizationOption | { id: 'new', images: string[] }) => {
    const images = isNewOption(option) 
      ? option.images 
      : [option.image_url, ...(option.additional_images || [])].filter((img): img is string => img !== null);
    
    if (images.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="w-16 h-16 rounded-lg overflow-hidden border-2" style={{ borderColor: `${PURPLE}22` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={image} 
                alt={`Option image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => removeImage(option.id, index)}
              className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {(option.id === 'new' || uploadingImages.has(`${option.id}-uploading`)) && (
          <div className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center" style={{ borderColor: `${PURPLE}44` }}>
            <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-md font-semibold text-gray-900">{categoryName} Options</h4>
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: PURPLE }}
        >
          <Plus className="h-3 w-3" />
          Add Option
        </button>
      </div>

      {/* Existing Options */}
      {options.map((option) => (
        <div
          key={option.id}
          className="rounded-lg border p-3 transition-shadow hover:shadow-sm"
          style={{ borderColor: `${PURPLE}22`, backgroundColor: "#FAFBFF" }}
        >
          {editingId === option.id ? (
            // Edit mode
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={option.name}
                  onChange={(e) => handleUpdateOption(option.id, { name: e.target.value })}
                  className="rounded-lg border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: `${PURPLE}44` }}
                  placeholder="Option name"
                />
                <input
                  type="number"
                  value={option.price_modifier}
                  onChange={(e) => handleUpdateOption(option.id, { price_modifier: parseFloat(e.target.value) || 0 })}
                  className="rounded-lg border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: `${PURPLE}44` }}
                  placeholder="Price modifier"
                  step="0.01"
                />
              </div>
              
              <textarea
                value={option.description || ""}
                onChange={(e) => handleUpdateOption(option.id, { description: e.target.value || null })}
                className="w-full rounded-lg border px-2 py-1 text-sm focus:outline-none focus:ring-2 resize-none"
                style={{ borderColor: `${PURPLE}44` }}
                placeholder="Option description (optional)"
                rows={2}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={option.track_inventory}
                      onChange={(e) => handleUpdateOption(option.id, { track_inventory: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Track inventory
                  </label>
                </div>
                {option.track_inventory && (
                  <input
                    type="number"
                    value={option.stock_quantity || ""}
                    onChange={(e) => handleUpdateOption(option.id, { stock_quantity: e.target.value ? parseInt(e.target.value) : null })}
                    className="rounded-lg border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: `${PURPLE}44` }}
                    placeholder="Stock quantity"
                  />
                )}
              </div>

              {/* Image upload */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-600">Images</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files, option.id)}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                    style={{ borderColor: `${PURPLE}44` }}
                  >
                    <Upload className="h-3 w-3 inline mr-1" />
                    Add Images
                  </button>
                </div>
                {renderOptionImages(option)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: PURPLE }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            // View mode
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-600" />
                  <h5 className="font-medium text-gray-900">{option.name}</h5>
                  {option.price_modifier !== 0 && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: `${GOLD}20`, color: GOLD }}
                    >
                      +${option.price_modifier.toFixed(2)}
                    </span>
                  )}
                </div>
                {option.description && (
                  <p className="mt-1 text-xs text-gray-600">{option.description}</p>
                )}
                {option.track_inventory && (
                  <p className="mt-1 text-xs text-gray-500">
                    Stock: {option.stock_quantity || 'Unlimited'}
                  </p>
                )}
                {renderOptionImages(option)}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingId(option.id)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  title="Edit option"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleDeleteOption(option.id)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Delete option"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add New Option Form */}
      {isAddingNew && (
        <div
          className="rounded-lg border p-3"
          style={{ borderColor: `${GOLD}44`, backgroundColor: `${GOLD}05` }}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newOptionName}
                onChange={(e) => setNewOptionName(e.target.value)}
                className="rounded-lg border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: `${PURPLE}44` }}
                placeholder="Option name"
                autoFocus
              />
              <input
                type="number"
                value={newOptionPrice}
                onChange={(e) => setNewOptionPrice(e.target.value)}
                className="rounded-lg border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: `${PURPLE}44` }}
                placeholder="Price modifier"
                step="0.01"
              />
            </div>

            <textarea
              value={newOptionDescription}
              onChange={(e) => setNewOptionDescription(e.target.value)}
              className="w-full rounded-lg border px-2 py-1 text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: `${PURPLE}44` }}
              placeholder="Option description (optional)"
              rows={2}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={newOptionTrackInventory}
                    onChange={(e) => setNewOptionTrackInventory(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Track inventory
                </label>
              </div>
              {newOptionTrackInventory && (
                <input
                  type="number"
                  value={newOptionStockQuantity}
                  onChange={(e) => setNewOptionStockQuantity(e.target.value)}
                  className="rounded-lg border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: `${PURPLE}44` }}
                  placeholder="Stock quantity"
                />
              )}
            </div>

            {/* Image upload */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-600">Images</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                  style={{ borderColor: `${PURPLE}44` }}
                >
                  <Upload className="h-3 w-3 inline mr-1" />
                  Add Images
                </button>
              </div>
              {renderOptionImages({ id: 'new', images: newOptionImages })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setNewOptionName("");
                  setNewOptionDescription("");
                  setNewOptionPrice("0");
                  setNewOptionImages([]);
                  setNewOptionStockQuantity("");
                  setNewOptionTrackInventory(false);
                }}
                className="rounded-lg px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOption}
                disabled={!newOptionName.trim()}
                className="rounded-lg px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: PURPLE }}
              >
                Add Option
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {options.length === 0 && !isAddingNew && (
        <div className="rounded-lg border-2 border-dashed p-4 text-center" style={{ borderColor: `${PURPLE}22` }}>
          <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            No {categoryName.toLowerCase()} options yet
          </p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: PURPLE }}
          >
            <Plus className="h-3 w-3" />
            Add First Option
          </button>
        </div>
      )}
    </div>
  );
}
