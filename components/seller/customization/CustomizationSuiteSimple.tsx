"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, ToggleLeft, ToggleRight, Plus, X, Upload, Package } from "lucide-react";
import { createCustomizationOption, updateCustomizationOption, deleteCustomizationOption } from "@/app/actions/customization";
import { uploadProductImage } from "@/lib/uploadProductImage";

interface CustomizationSuiteSimpleProps {
  productId: string;
  userId: string;
  initialEnabled?: boolean;
  customGroups?: any[];
  onCustomGroupsChange?: (groups: any[]) => void;
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
  saveStatus?: 'idle' | 'saving' | 'success' | 'error';
}

const DEFAULT_CATEGORIES = [
  "Doors",
  "Windows", 
  "Flooring",
  "Interior Walls",
  "Exterior Walls"
];

export function CustomizationSuiteSimple({ productId, userId, initialEnabled = false, customGroups, onCustomGroupsChange }: CustomizationSuiteSimpleProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [options, setOptions] = useState<OptionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

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
        // Transform database data to OptionRow format
        const transformedOptions: OptionRow[] = [];
        
        result.data.forEach(group => {
          group.options.forEach(option => {
            // Extract door type from group name if it exists
            const doorTypeMatch = group.name.match(/\((interior|exterior)\)$/);
            const doorType = doorTypeMatch ? doorTypeMatch[1] as 'interior' | 'exterior' : undefined;
            
            transformedOptions.push({
              id: option.id,
              category: group.name.replace(/\s*\((interior|exterior)\)$/, ''),
              name: option.name,
              code: '', // We'll need to add this field to database
              price: option.price_modifier.toString(),
              images: [option.image_url, ...(option.additional_images || [])].filter((img): img is string => img !== null),
              isNew: false,
              uploading: false,
              doorType,
              saveStatus: 'idle'
            });
          });
        });
        
        setOptions(transformedOptions);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error("Error loading options:", error);
      setOptions([]);
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
      doorType: 'interior',
      saveStatus: 'idle'
    };
    setOptions(prev => [...prev, newRow]);
  };

  const handleImageUpload = async (files: FileList, rowIndex: number) => {
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }

    console.log('Starting image upload for:', rowIndex, files);
    console.log('User ID:', userId);
    const imageUrls: string[] = [];
    
    try {
      // Update uploading state
      setOptions(prev => prev.map((opt, idx) => 
        idx === rowIndex ? { ...opt, uploading: true } : opt
      ));

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        try {
          const url = await uploadProductImage(file, userId, Date.now());
          console.log('Upload successful for:', file.name, 'URL:', url);
          imageUrls.push(url);
        } catch (fileError) {
          console.error('Failed to upload file:', file.name, fileError);
        }
      }
      
      console.log('All files processed. URLs:', imageUrls);
    } catch (error) {
      console.error("Error in upload process:", error);
    } finally {
      // Update images
      setOptions(prev => prev.map((opt, idx) => 
        idx === rowIndex 
          ? { ...opt, images: [...opt.images, ...imageUrls], uploading: false }
          : opt
      ));
      console.log('Upload process completed. Final image count:', imageUrls.length);
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
    console.log('Saving option at row:', rowIndex, option);
    
    if (!option.name.trim()) {
      setOptions(prev => prev.map((opt, idx) => 
        idx === rowIndex ? { ...opt, saveStatus: 'error' } : opt
      ));
      return;
    }

    // Set saving status
    setOptions(prev => prev.map((opt, idx) => 
      idx === rowIndex ? { ...opt, saveStatus: 'saving' } : opt
    ));

    try {
      if (option.id === 'new') {
        console.log('Creating new option with data:', {
          name: option.name.trim(),
          price: option.price,
          images: option.images,
          category: option.category,
          doorType: option.doorType
        });

        // First create a group for this option
        const groupName = option.category === 'Doors' && option.doorType 
          ? `${option.category} (${option.doorType})`
          : option.category;

        console.log('Creating group with name:', groupName);

        const { createCustomizationGroup } = await import("@/app/actions/customization");
        const groupResult = await createCustomizationGroup({
          product_id: productId,
          name: groupName,
          description: null,
          is_required: false,
        });

        console.log('Group creation result:', groupResult);

        if (groupResult.error) {
          console.error('Failed to create group:', groupResult.error);
          setOptions(prev => prev.map((opt, idx) => 
            idx === rowIndex ? { ...opt, saveStatus: 'error' } : opt
          ));
          return;
        }

        // Now create the option with the real group ID
        const result = await createCustomizationOption({
          group_id: groupResult.data!.id,
          name: option.name.trim(),
          description: null,
          price_modifier: parseFloat(option.price) || 0,
          image_url: option.images[0] || null,
          additional_images: option.images.length > 1 ? option.images.slice(1) : null,
          stock_quantity: null,
          track_inventory: false,
        });

        console.log('Option creation result:', result);

        if (result.data) {
          console.log('Updating option state from new to saved');
          setOptions(prev => {
            const updated = prev.map((opt, idx) =>
              idx === rowIndex ? { ...opt, id: result.data!.id, isNew: false, saveStatus: 'success' as const } : opt
            );
            console.log('Updated options:', updated);
            return updated;
          });

          // Sync to parent after successful save
          syncCustomGroups();

          // Reset to idle after 3 seconds
          setTimeout(() => {
            setOptions(prev => prev.map((opt, idx) =>
              idx === rowIndex ? { ...opt, saveStatus: 'idle' as const } : opt
            ));
          }, 3000);
        } else {
          console.error('Failed to save option:', result.error);
          setOptions(prev => prev.map((opt, idx) =>
            idx === rowIndex ? { ...opt, saveStatus: 'error' as const } : opt
          ));
        }
      } else {
        console.log('Updating existing option:', option.id);
        await updateCustomizationOption(option.id, {
          name: option.name.trim(),
          price_modifier: parseFloat(option.price) || 0,
          image_url: option.images[0] || null,
          additional_images: option.images.length > 1 ? option.images.slice(1) : null,
        });

        setOptions(prev => prev.map((opt, idx) =>
          idx === rowIndex ? { ...opt, saveStatus: 'success' as const } : opt
        ));

        // Sync to parent after successful update
        syncCustomGroups();

        // Reset to idle after 3 seconds
        setTimeout(() => {
          setOptions(prev => prev.map((opt, idx) =>
            idx === rowIndex ? { ...opt, saveStatus: 'idle' as const } : opt
          ));
        }, 3000);
      }
    } catch (error) {
      console.error("Error saving option:", error);
      setOptions(prev => prev.map((opt, idx) =>
        idx === rowIndex ? { ...opt, saveStatus: 'error' as const } : opt
      ));
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
      syncCustomGroups();
    } catch (error) {
      console.error("Error deleting option:", error);
      alert('Error deleting option. Please try again.');
    }
  };

  // Transform internal options to customGroups format for parent
  const syncCustomGroups = () => {
    if (!onCustomGroupsChange) return;

    // Group options by category
    const grouped: Record<string, OptionRow[]> = {};
    options.forEach(opt => {
      if (!grouped[opt.category]) {
        grouped[opt.category] = [];
      }
      grouped[opt.category].push(opt);
    });

    // Transform to customGroups format
    const transformedGroups = Object.entries(grouped).map(([category, opts]) => ({
      id: opts[0].id === 'new' ? `new-${category}` : opts[0].id,
      name: category,
      options: opts.map(opt => ({
        id: opt.id === 'new' ? `new-${opt.name}` : opt.id,
        name: opt.name,
        priceModifier: parseFloat(opt.price) || 0,
        imageUrl: opt.images[0] || "",
      })),
    }));

    onCustomGroupsChange(transformedGroups);
  };

  return (
    <div className="space-y-6">
      {/* Hidden file inputs for each row */}
      {options.map((option, index) => (
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
      ))}

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
                      {option.images.length > 0 ? (
                        <div className="flex gap-1">
                          {option.images.slice(0, 6).map((image, imgIndex) => (
                            <div key={imgIndex} className="relative group">
                              <div className="w-12 h-12 rounded border overflow-hidden" style={{ borderColor: `${PURPLE}22` }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={image} alt={`Option ${index + 1}`} className="w-full h-full object-cover" />
                              </div>
                              <button
                                onClick={() => {
                                  console.log('Removing image:', imgIndex);
                                  handleRemoveImage(index, imgIndex);
                                }}
                                className="absolute -top-0.5 -right-0.5 rounded-full bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          {option.images.length > 6 && (
                            <div className="w-12 h-12 rounded border flex items-center justify-center text-xs text-gray-500" style={{ borderColor: `${PURPLE}22` }}>
                              +{option.images.length - 6}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              console.log('Add more images for row:', index);
                              fileInputRefs.current[`${index}-main`]?.click();
                            }}
                            disabled={option.uploading}
                            className="w-12 h-12 rounded border flex items-center justify-center text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            style={{ borderColor: `${PURPLE}44` }}
                          >
                            <Upload className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Upload button clicked for row:', index);
                            console.log('File input ref:', fileInputRefs.current[`${index}-main`]);
                            const fileInput = fileInputRefs.current[`${index}-main`];
                            if (fileInput) {
                              fileInput.click();
                            } else {
                              console.error('File input not found for row:', index);
                            }
                          }}
                          disabled={option.uploading}
                          className="flex items-center gap-1 rounded border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                          style={{ borderColor: `${PURPLE}44` }}
                        >
                          {option.uploading ? (
                            <div className="animate-spin h-3 w-3 border border-gray-300 border-t-purple-600 rounded-full"></div>
                          ) : (
                            <Upload className="h-3 w-3" />
                          )}
                          <span>{option.uploading ? 'Uploading...' : 'Upload'}</span>
                        </button>
                      )}
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
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          {option.isNew && (
                            <button
                              type="button"
                              onClick={() => handleSave(index)}
                              disabled={!option.name.trim() || option.saveStatus === 'saving'}
                              className="rounded px-2 py-1 text-xs font-medium text-white disabled:opacity-50 transition-colors"
                              style={{ 
                                backgroundColor: option.saveStatus === 'success' ? '#10b981' : 
                                              option.saveStatus === 'error' ? '#ef4444' :
                                              option.saveStatus === 'saving' ? '#6b7280' : PURPLE 
                              }}
                            >
                              {option.saveStatus === 'saving' ? 'Saving...' : 'Save'}
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
                        
                        {/* Status Message */}
                        {option.saveStatus && option.saveStatus !== 'idle' && (
                          <div className={`text-xs ${option.saveStatus === 'success' ? 'text-green-600' : option.saveStatus === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                            {option.saveStatus === 'success' && '✓ Saved successfully'}
                            {option.saveStatus === 'error' && '✗ Failed to save'}
                            {option.saveStatus === 'saving' && 'Saving...'}
                          </div>
                        )}
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
        </div>
      )}
    </div>
  );
}
