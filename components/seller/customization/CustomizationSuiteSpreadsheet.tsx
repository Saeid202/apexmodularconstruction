"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, ToggleLeft, ToggleRight, Plus, X, Edit2, Upload, Image as ImageIcon, Package, DollarSign, GripVertical } from "lucide-react";
import { createCustomizationGroup, updateCustomizationGroup, deleteCustomizationGroup, getCustomizationGroups } from "@/app/actions/customization";
import { createCustomizationOption, updateCustomizationOption, deleteCustomizationOption } from "@/app/actions/customization";
import { uploadProductImage } from "@/lib/uploadProductImage";
import type { Database } from "@/types/database";

type CustomizationGroup = Database['public']['Tables']['product_customization_groups']['Row'];
type CustomizationOption = Database['public']['Tables']['product_customization_options']['Row'];

interface CustomizationSuiteSpreadsheetProps {
  productId: string;
  userId: string;
  initialEnabled?: boolean;
}

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

interface OptionRow {
  id: string | 'new';
  name: string;
  code: string;
  price: string;
  images: string[];
  uploading: boolean;
  isNew?: boolean;
}

interface CategoryData {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  options: OptionRow[];
}

export function CustomizationSuiteSpreadsheet({ productId, userId, initialEnabled = false }: CustomizationSuiteSpreadsheetProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load customization data when enabled
  useEffect(() => {
    if (isEnabled) {
      loadCustomizationData();
    } else {
      setCategories([]);
      setSelectedCategoryId(null);
    }
  }, [isEnabled, productId]);

  const loadCustomizationData = async () => {
    setLoading(true);
    try {
      const result = await getCustomizationGroups(productId);
      if (result.data) {
        const transformedCategories = result.data.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          isRequired: cat.is_required,
          options: cat.options.map(opt => ({
            id: opt.id,
            name: opt.name,
            code: '', // We'll add this field
            price: opt.price_modifier.toString(),
            images: [opt.image_url, ...(opt.additional_images || [])].filter((img): img is string => img !== null),
            uploading: false
          }))
        }));
        setCategories(transformedCategories);
        if (transformedCategories.length > 0) {
          setSelectedCategoryId(transformedCategories[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading customization data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddCategory = (categoryName: string) => {
    // Create a temporary category that's not yet saved to database
    const tempCategory: CategoryData = {
      id: `temp-${Date.now()}`, // Temporary ID
      name: categoryName,
      description: '',
      isRequired: false,
      options: []
    };
    setCategories(prev => [...prev, tempCategory]);
    setSelectedCategoryId(tempCategory.id);
  };

  const saveCategory = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category || !category.id.startsWith('temp-')) return; // Only save temp categories

    try {
      const result = await createCustomizationGroup({
        product_id: productId,
        name: category.name,
        description: category.description || null,
        is_required: category.isRequired,
      });

      if (result.data) {
        // Replace temp category with real one
        setCategories(prev => prev.map(cat => 
          cat.id === categoryId 
            ? { ...cat, id: result.data!.id, description: result.data!.description || '', isRequired: result.data!.is_required }
            : cat
        ));
        setSelectedCategoryId(result.data.id);
      }
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleAddCategory = async () => {
    // Show dropdown with default categories
    const defaultCategories = [
      "Doors",
      "Windows", 
      "Flooring",
      "Interior Walls",
      "Exterior Walls"
    ];

    const selectedName = prompt(
      `Enter category name or choose from defaults:\n\n${defaultCategories.map((cat, i) => `${i + 1}. ${cat}`).join('\n')}\n\nEnter number (1-5) or custom name:`
    );

    if (!selectedName?.trim()) return;

    let categoryName = selectedName.trim();
    
    // Check if user entered a number
    const numIndex = parseInt(selectedName);
    if (numIndex >= 1 && numIndex <= defaultCategories.length) {
      categoryName = defaultCategories[numIndex - 1];
    }

    try {
      const result = await createCustomizationGroup({
        product_id: productId,
        name: categoryName,
        description: null,
        is_required: false,
      });

      if (result.data) {
        const newCategory: CategoryData = {
          id: result.data.id,
          name: result.data.name,
          description: result.data.description || '',
          isRequired: result.data.is_required,
          options: []
        };
        setCategories(prev => [...prev, newCategory]);
        setSelectedCategoryId(newCategory.id);
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleAddOption = (categoryId: string) => {
    const newOption: OptionRow = {
      id: 'new',
      name: '',
      code: '',
      price: '0',
      images: [],
      uploading: false,
      isNew: true
    };

    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, options: [...cat.options, newOption] }
        : cat
    ));
  };

  const handleImageUpload = async (files: FileList, categoryId: string, optionIndex: number) => {
    if (!files || files.length === 0) return;

    const imageUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadId = `${categoryId}-${optionIndex}-${Date.now()}-${i}`;
        
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

      setCategories(prev => prev.map(cat => {
        if (cat.id === categoryId) {
          const updatedOptions = [...cat.options];
          updatedOptions[optionIndex] = {
            ...updatedOptions[optionIndex],
            images: [...updatedOptions[optionIndex].images, ...imageUrls]
          };
          return { ...cat, options: updatedOptions };
        }
        return cat;
      }));
    } catch (error) {
      console.error("Error in image upload process:", error);
    }
  };

  const handleOptionChange = (categoryId: string, optionIndex: number, field: keyof OptionRow, value: any) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        const updatedOptions = [...cat.options];
        updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [field]: value };
        return { ...cat, options: updatedOptions };
      }
      return cat;
    }));
  };

  const handleRemoveImage = (categoryId: string, optionIndex: number, imageIndex: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        const updatedOptions = [...cat.options];
        updatedOptions[optionIndex] = {
          ...updatedOptions[optionIndex],
          images: updatedOptions[optionIndex].images.filter((_, idx) => idx !== imageIndex)
        };
        return { ...cat, options: updatedOptions };
      }
      return cat;
    }));
  };

  const handleSaveOption = async (categoryId: string, optionIndex: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    const option = category?.options[optionIndex];
    
    if (!option || !option.name.trim()) return;

    try {
      if (option.id === 'new') {
        // Create new option
        const result = await createCustomizationOption({
          group_id: categoryId,
          name: option.name.trim(),
          description: null,
          price_modifier: parseFloat(option.price) || 0,
          image_url: option.images[0] || null,
          additional_images: option.images.length > 1 ? option.images.slice(1) : null,
          stock_quantity: null,
          track_inventory: false,
        });

        if (result.data) {
          handleOptionChange(categoryId, optionIndex, 'id', result.data.id);
          handleOptionChange(categoryId, optionIndex, 'isNew', false);
        }
      } else {
        // Update existing option
        await updateCustomizationOption(option.id, {
          name: option.name.trim(),
          price_modifier: parseFloat(option.price) || 0,
          image_url: option.images[0] || null,
          additional_images: option.images.length > 1 ? option.images.slice(1) : null,
        });
      }
    } catch (error) {
      console.error("Error saving option:", error);
    }
  };

  const handleDeleteOption = async (categoryId: string, optionIndex: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    const option = category?.options[optionIndex];
    
    if (!option) return;

    if (option.id !== 'new') {
      try {
        await deleteCustomizationOption(option.id);
      } catch (error) {
        console.error("Error deleting option:", error);
        return;
      }
    }

    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, options: cat.options.filter((_, idx) => idx !== optionIndex) };
      }
      return cat;
    }));
  };

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "#EDE9F6" }}>
            <Settings className="h-4 w-4" style={{ color: PURPLE }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Customization Suite</h3>
            <p className="text-sm text-gray-600">
              Professional spreadsheet-style customization manager
            </p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => setIsEnabled(!isEnabled)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: isEnabled ? `${PURPLE}15` : "#F3F4F6",
            color: isEnabled ? PURPLE : "#6B7280",
            border: `2px solid ${isEnabled ? PURPLE : "#E5E7EB"}`,
          }}
        >
          {isEnabled ? (
            <>
              <ToggleRight className="h-4 w-4" />
              Enabled
            </>
          ) : (
            <>
              <ToggleLeft className="h-4 w-4" />
              Disabled
            </>
          )}
        </button>
      </div>

      {/* Spreadsheet Layout */}
      {isEnabled && (
        <div className="flex gap-6" style={{ minHeight: '500px' }}>
          {/* Left Sidebar - Categories */}
          <div className="w-64 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Categories</h4>
              <button
                onClick={handleAddCategory}
                className="rounded-lg p-1 text-purple-600 hover:bg-purple-50 transition-colors"
                title="Add Category"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {/* Quick Add Default Categories */}
            {categories.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">Quick Add Common Categories:</p>
                <div className="grid grid-cols-2 gap-1">
                  {["Doors", "Windows", "Flooring", "Interior Walls", "Exterior Walls"].map((catName) => (
                    <button
                      key={catName}
                      onClick={() => handleQuickAddCategory(catName)}
                      className="text-xs p-2 rounded border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      {catName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Categories */}
            <div className="space-y-2">
              {categories.map((category) => {
                const isTemp = category.id.startsWith('temp-');
                return (
                  <div
                    key={category.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedCategoryId === category.id
                        ? 'border-purple-500 bg-purple-50'
                        : isTemp
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-gray-900">{category.name}</h5>
                          {isTemp && (
                            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                              Not Saved
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{category.options.length} options</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isTemp && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveCategory(category.id);
                            }}
                            className="text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                          >
                            Save
                          </button>
                        )}
                        {category.isRequired && (
                          <span className="text-xs font-medium text-purple-600">Required</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Area - Options Table */}
          <div className="flex-1">
            {selectedCategory ? (
              <div className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedCategory.name}</h4>
                    {selectedCategory.description && (
                      <p className="text-sm text-gray-600">{selectedCategory.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddOption(selectedCategory.id)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: PURPLE }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Option
                  </button>
                </div>

                {/* Options Table */}
                <div className="border rounded-lg overflow-hidden" style={{ borderColor: `${PURPLE}22` }}>
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b" style={{ borderColor: `${PURPLE}22` }}>
                    <div className="col-span-1 text-xs font-medium text-gray-700">#</div>
                    <div className="col-span-3 text-xs font-medium text-gray-700">Images</div>
                    <div className="col-span-3 text-xs font-medium text-gray-700">Name/Code</div>
                    <div className="col-span-2 text-xs font-medium text-gray-700">Price Modifier</div>
                    <div className="col-span-2 text-xs font-medium text-gray-700">Actions</div>
                  </div>

                  {/* Option Rows */}
                  {selectedCategory.options.map((option, index) => (
                    <div key={option.id} className="grid grid-cols-12 gap-4 p-3 border-b items-center" style={{ borderColor: `${PURPLE}15` }}>
                      {/* Row Number */}
                      <div className="col-span-1">
                        <div className="flex items-center gap-1">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{index + 1}</span>
                        </div>
                      </div>

                      {/* Images */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          {option.images.length > 0 ? (
                            <div className="flex gap-1">
                              {option.images.slice(0, 3).map((image, imgIndex) => (
                                <div key={imgIndex} className="relative group">
                                  <div className="w-12 h-12 rounded border-2 overflow-hidden" style={{ borderColor: `${PURPLE}22` }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={image} alt={`Option ${index + 1}`} className="w-full h-full object-cover" />
                                  </div>
                                  <button
                                    onClick={() => handleRemoveImage(selectedCategory.id, index, imgIndex)}
                                    className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-2 w-2" />
                                  </button>
                                </div>
                              ))}
                              {option.images.length > 3 && (
                                <div className="w-12 h-12 rounded border-2 flex items-center justify-center text-xs text-gray-500" style={{ borderColor: `${PURPLE}22` }}>
                                  +{option.images.length - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => e.target.files && handleImageUpload(e.target.files, selectedCategory.id, index)}
                              />
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-1 rounded border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                                style={{ borderColor: `${PURPLE}44` }}
                              >
                                <Upload className="h-3 w-3" />
                                Upload
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Name/Code */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => handleOptionChange(selectedCategory.id, index, 'name', e.target.value)}
                          placeholder="Option name"
                          className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                          style={{ borderColor: `${PURPLE}44` }}
                        />
                        <input
                          type="text"
                          value={option.code}
                          onChange={(e) => handleOptionChange(selectedCategory.id, index, 'code', e.target.value)}
                          placeholder="Code (optional)"
                          className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 mt-1"
                          style={{ borderColor: `${PURPLE}44` }}
                        />
                      </div>

                      {/* Price */}
                      <div className="col-span-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
                          <input
                            type="number"
                            value={option.price}
                            onChange={(e) => handleOptionChange(selectedCategory.id, index, 'price', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full rounded border pl-5 pr-2 py-1 text-sm focus:outline-none focus:ring-2"
                            style={{ borderColor: `${PURPLE}44` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-1">
                          {option.isNew && (
                            <button
                              onClick={() => handleSaveOption(selectedCategory.id, index)}
                              disabled={!option.name.trim()}
                              className="rounded px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                              style={{ backgroundColor: PURPLE }}
                            >
                              Save
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteOption(selectedCategory.id, index)}
                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  {selectedCategory.options.length === 0 && (
                    <div className="p-8 text-center">
                      <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">No options yet. Add your first option to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Category</h3>
                  <p className="text-sm text-gray-600">Choose a category from the sidebar to manage its options.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disabled State */}
      {!isEnabled && (
        <div
          className="rounded-xl border-2 border-dashed p-8 text-center"
          style={{ borderColor: `${PURPLE}22` }}
        >
          <Settings className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Customization Suite Disabled</h3>
          <p className="text-sm text-gray-600 mb-4">
            Enable the customization suite to manage product options in a professional spreadsheet layout.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Categories sidebar for easy navigation</p>
            <p>• Spreadsheet-style option management</p>
            <p>• Image upload with thumbnail preview</p>
            <p>• Name, code, and price in single row</p>
          </div>
        </div>
      )}
    </div>
  );
}
