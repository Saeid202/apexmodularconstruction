"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, ToggleLeft, ToggleRight, Plus, X, Upload, Image as ImageIcon, Package, DollarSign } from "lucide-react";
import { createCustomizationOption, updateCustomizationOption, deleteCustomizationOption } from "@/app/actions/customization";
import { uploadProductImage } from "@/lib/uploadProductImage";

interface CustomizationSuiteSimpleProps {
  productId: string;
  userId: string;
  initialEnabled?: boolean;
}

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

interface OptionRow {
  id: string | 'new';
  category: string;
  name: string;
  code: string;
  price: string;
  images: string[];
  isNew?: boolean;
  uploading: boolean;
  doorType?: 'interior' | 'exterior';
}

const DEFAULT_CATEGORIES = [
  "Doors",
  "Windows", 
  "Flooring",
  "Interior Walls",
  "Exterior Walls"
];

export function CustomizationSuiteSimpleWorking({ productId, userId, initialEnabled = false }: CustomizationSuiteSimpleProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [options, setOptions] = useState<OptionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Load existing options when enabled
  useEffect(() => {
    if (isEnabled) {
      loadExistingOptions();
    } else {
      setOptions([]);
    }
  }, [isEnabled, productId]);

  const loadExistingOptions = async () => {
    setLoading(true);
    try {
      const { getCustomizationGroups } = await import("@/app/actions/customization");
      const result = await getCustomizationGroups(productId);
      
      if (result.data && result.data.length > 0) {
        // Transform database result to OptionRow format
        const transformedOptions: OptionRow[] = result.data.map((group: any) => ({
          id: group.id,
          category: group.name || DEFAULT_CATEGORIES[0],
          name: group.name || '',
          code: '',
          price: '',
          images: [],
          uploading: false,
        }));
        setOptions(transformedOptions);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error("Error loading options:", error);
    } finally {
      setLoading(false);
    }
  };

  const addNewRow = () => {
    const newRow: OptionRow = {
      id: 'new',
      category: DEFAULT_CATEGORIES[0],
      name: '',
      code: '',
      price: '0',
      images: [],
      isNew: true,
      uploading: false,
      doorType: 'interior'
    };
    setOptions(prev => [...prev, newRow]);
  };

  const handleImageUpload = async (files: FileList, rowIndex: number) => {
    if (!files || files.length === 0) return;

    console.log('Starting image upload for:', rowIndex, files);
    const imageUrls: string[] = [];
    const currentOption = options[rowIndex];
    
    try {
      setOptions(prev => prev.map((opt, idx) => 
        idx === rowIndex ? { ...opt, uploading: true } : opt
      ));

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadProductImage(file, userId, Date.now());
        imageUrls.push(url);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setOptions(prev => prev.map((opt, idx) => 
        idx === rowIndex 
          ? { ...opt, images: [...opt.images, ...imageUrls], uploading: false }
          : opt
      ));
    }
  };

  const handleRemoveImage = (rowIndex: number, imageIndex: number) => {
    setOptions(prev => prev.map((opt, idx) => {
      if (idx === rowIndex) {
        return {
          ...opt,
          images: opt.images.filter((_, imgIdx) => imgIdx !== imageIndex)
        };
      }
      return opt;
    }));
  };

  const handleFieldChange = (rowIndex: number, field: keyof OptionRow, value: any) => {
    setOptions(prev => prev.map((opt, idx) => 
      idx === rowIndex ? { ...opt, [field]: value } : opt
    ));
  };

  const handleSave = async (rowIndex: number) => {
    const option = options[rowIndex];
    
    if (!option.name.trim()) {
      alert('Please enter a name for this option');
      return;
    }

    try {
      if (option.id === 'new') {
        const result = await createCustomizationOption({
          group_id: 'default-placeholder',
          name: option.name.trim(),
          description: null,
          price_modifier: parseFloat(option.price) || 0,
          image_url: option.images[0] || null,
          additional_images: option.images.length > 1 ? option.images.slice(1) : null,
          stock_quantity: null,
          track_inventory: false,
        });

        if (result.data) {
          setOptions(prev => prev.map((opt, idx) => 
            idx === rowIndex ? { ...opt, id: result.data!.id, isNew: false } : opt
          ));
          alert('Option saved successfully!');
        }
      } else {
        await updateCustomizationOption(option.id, {
          name: option.name.trim(),
          price_modifier: parseFloat(option.price) || 0,
          image_url: option.images[0] || null,
          additional_images: option.images.length > 1 ? option.images.slice(1) : null,
        });
        
        alert('Option updated successfully!');
      }
    } catch (error) {
      console.error("Error saving option:", error);
      alert('Error saving option. Please try again.');
    }
  };

  const handleDelete = async (rowIndex: number) => {
    const option = options[rowIndex];
    
    if (!confirm('Are you sure you want to delete this option?')) return;

    try {
      if (option.id !== 'new') {
        await deleteCustomizationOption(option.id);
      }
      
      setOptions(prev => prev.filter((_, idx) => idx !== rowIndex));
    } catch (error) {
      console.error("Error deleting option:", error);
      alert('Error deleting option. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "#EDE9F6" }}>
            <Settings className="h-4 w-4" style={{ color: PURPLE }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Product Customization</h3>
            <p className="text-sm text-gray-600">
              Allow buyers to select custom doors, windows, flooring, etc.
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
              <span>Enabled</span>
            </>
          ) : (
            <>
              <ToggleLeft className="h-4 w-4" />
              <span>Disabled</span>
            </>
          )}
        </button>
      </div>

      {isEnabled && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={addNewRow}
            className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: PURPLE }}
          >
            <Plus className="h-4 w-4" />
            Add New Customization Option
          </button>

          {options.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed p-8 text-center" style={{ borderColor: `${PURPLE}22` }}>
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Customization Options</h3>
              <p className="text-sm text-gray-600 mb-4">
                Click "Add New Customization Option" to get started.
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Select category (Doors, Windows, Flooring, etc.)</p>
                <p>• Upload product images</p>
                <p>• Set name, code, and price</p>
              </div>
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <div className="grid grid-cols-8 gap-2 p-3 bg-gray-50 border-b font-medium text-xs text-gray-700" style={{ backgroundColor: `${PURPLE}05` }}>
                <div>Category</div>
                <div>Door Type</div>
                <div>Images</div>
                <div>Name</div>
                <div>Code</div>
                <div>Price Modifier</div>
                <div>Actions</div>
              </div>

              <div className="divide-y divide-gray-200">
                {options.map((option, index) => (
                  <div key={option.id} className="grid grid-cols-8 gap-2 p-3 items-center hover:bg-gray-50" style={{ 
                    backgroundColor: option.isNew ? `${GOLD}10` : 'transparent'
                  }}>
                    <input
                      key={`file-input-${index}`}
                      ref={(el) => {
                        fileInputRefs.current[`${index}-main`] = el;
                      }}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files, index)}
                    />
                    <div className="text-sm">
                      <select
                        value={option.category}
                        onChange={(e) => handleFieldChange(index, 'category', e.target.value)}
                        className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                        style={{ borderColor: `${PURPLE}44` }}
                      >
                        {DEFAULT_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="text-sm">
                      {option.category === 'Doors' ? (
                        <select
                          value={option.doorType || 'interior'}
                          onChange={(e) => handleFieldChange(index, 'doorType', e.target.value as 'interior' | 'exterior')}
                          className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                          style={{ borderColor: `${PURPLE}44` }}
                        >
                          <option value="interior">Interior</option>
                          <option value="exterior">Exterior</option>
                        </select>
                      ) : (
                        <div className="text-gray-400">-</div>
                      )}
                    </div>

                    <div className="text-sm">
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[`${index}-main`]?.click()}
                        disabled={option.uploading}
                        className="flex items-center gap-1 rounded border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        style={{ borderColor: `${PURPLE}44` }}
                      >
                        {option.uploading ? (
                          <>
                            <div className="animate-spin h-3 w-3 border border-gray-300 border-t-purple-600 rounded-full"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3 w-3" />
                            Upload
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-sm">
                      <input
                        type="text"
                        value={option.name}
                        onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                        placeholder="Option name"
                        className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                        style={{ borderColor: `${PURPLE}44` }}
                      />
                    </div>

                    <div className="text-sm">
                      <input
                        type="text"
                        value={option.code}
                        onChange={(e) => handleFieldChange(index, 'code', e.target.value)}
                        placeholder="Product code"
                        className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                        style={{ borderColor: `${PURPLE}44` }}
                      />
                    </div>

                    <div className="text-sm">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
                        <input
                          type="number"
                          value={option.price}
                          onChange={(e) => handleFieldChange(index, 'price', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full rounded border pl-5 pr-2 py-1 text-sm focus:outline-none focus:ring-2"
                          style={{ borderColor: `${PURPLE}44` }}
                        />
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="flex gap-1">
                        {option.isNew && (
                          <button
                            type="button"
                            onClick={() => handleSave(index)}
                            disabled={!option.name.trim()}
                            className="rounded px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                            style={{ backgroundColor: PURPLE }}
                          >
                            Save
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(index)}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isEnabled && (
        <div className="rounded-xl border-2 border-dashed p-8 text-center" style={{ borderColor: `${PURPLE}22` }}>
          <Settings className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Customization Disabled</h3>
          <p className="text-sm text-gray-600 mb-4">
            Enable customization to allow buyers to select custom doors, windows, flooring, etc.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Simple row-based interface</p>
            <p>• Category dropdown with default options</p>
            <p>• Interior/Exterior door types</p>
            <p>• Multi-image upload (up to 6 images)</p>
            <p>• Professional table layout</p>
          </div>
        </div>
      )}
    </div>
  );
}
