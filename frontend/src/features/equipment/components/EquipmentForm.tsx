import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import type { Equipment, Rack } from '@/types';
import {type  EquipmentFormInput, equipmentSchema } from '@/types/schemas';
import { useUpdateEquipment, useCreateEquipment, useRackSlots } from '../hooks/useEquipment';
import { useRacks } from '@/features/racks/hooks/useRacks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormMessage } from '@/components/ui/form';
import { handleBackendErrors } from '@/utils/errorHandler';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';



interface EquipmentFormProps {
  equipment?: Equipment;
  onSuccess?: () => void;
  isLoading?: boolean;
  defaultRackId?: number;
  defaultSlotPosition?: number;
  isSlotLocked?: boolean;
}

export function EquipmentForm({
  equipment,
  onSuccess,
  isLoading = false,
  defaultRackId,
  defaultSlotPosition,
  isSlotLocked = false,
}: EquipmentFormProps) {
  const [selectedRackId, setSelectedRackId] = useState<number | null>(
    equipment?.rack_id || defaultRackId || null
  );
  const EQUIPMENT_TYPES = [
    { label: 'Server', value: 'server' },
    { label: 'Switch', value: 'switch' },
    { label: 'Router', value: 'router' },
    { label: 'Database', value: 'database' },
    { label: 'Firewall', value: 'firewall' },
    { label: 'PDU', value: 'pdu' },
  ];

  const isEditing = !!equipment;
  const updateEquipment = useUpdateEquipment();
  const createEquipment = useCreateEquipment();
  const mutation = isEditing ? updateEquipment : createEquipment;
  const { data: racksData } = useRacks();
  const racks = racksData?.data || [];

  // Fetch slots for the selected rack
  const { data: slotsData, isLoading: slotsLoading } = useRackSlots(selectedRackId);
  const slots = slotsData?.data;

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EquipmentFormInput>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: equipment
      ? {
          tag: equipment.tag,
          name: equipment.name,
          type: equipment.type,
          model: equipment.model,
          slot_position: equipment.slot_position,
          serial_number: equipment.serial_number,
          status: equipment.status as any,
          rack_id: equipment.rack_id,
        }
      : {
          rack_id: defaultRackId,
          slot_position: defaultSlotPosition,
        },
  });

  const rackIdValue = watch('rack_id');
  const slotPositionValue = watch('slot_position');

  // Update selectedRackId when form value changes
  useEffect(() => {
    const id = rackIdValue ? Number(rackIdValue) : null;
    setSelectedRackId(id);
  }, [rackIdValue]);

  const onSubmit = async (data: EquipmentFormInput) => {
    try {
      const submitData = {
        ...data,
        ...(defaultSlotPosition && { slot_position: defaultSlotPosition }),
      };

      if (isEditing && equipment) {
        await updateEquipment.mutateAsync({
          id: equipment.id,
          data: submitData,
        });
        toast.success('Equipment updated successfully');
      } else {
        await createEquipment.mutateAsync(submitData);
        toast.success('Equipment created successfully');
        reset();
      }
      onSuccess?.();
    } catch (error) {
      const errorMessage = handleBackendErrors(error, setError);
      toast.error(errorMessage);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField>
        <Label htmlFor="tag">Tag *</Label>
        <Input
          id="tag"
          placeholder="e.g., SYR-X100"
          disabled={isSubmitting || isLoading}
          {...register('tag')}
        />
        {errors.tag && <FormMessage>{errors.tag.message}</FormMessage>}
      </FormField>

      {/* Rack Dropdown */}
      <FormField>
        <Label htmlFor="rack_id">Rack</Label>
        <select
          id="rack_id"
          {...register('rack_id')}
          disabled={isSubmitting || isLoading || isSlotLocked}
          className="w-full px-3 py-1.5 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-60"
        >
          {/* Explicit empty value represents unassigned hardware profiles */}
          <option value="">Select a rack</option>
          {racks.map((rack: Rack) => (
            <option key={rack.id} value={rack.id}>
              {rack.tag} - {rack.name}
            </option>
          ))}
        </select>
        {errors.rack_id && <FormMessage>{errors.rack_id.message}</FormMessage>}
      </FormField>

      {/* Slot Position field */}
      <FormField>
        <Label htmlFor="slot_position">
          Slot Position (U)
          {selectedRackId && slotsLoading && <Loader2 className="inline ml-1 w-3 h-3 animate-spin" />}
        </Label>
        {selectedRackId ? (
          <>
            <select
              id="slot_position"
              {...register('slot_position', { valueAsNumber: true })}
              disabled={isSubmitting || isLoading || slotsLoading || !slots || isSlotLocked}
              className="w-full px-3 py-1.5 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-60"
            >
              <option value="">Select a slot</option>
              {/* Include current slot if editing or if slot is locked */}
              {(isEditing || isSlotLocked) && slotPositionValue && !slots?.available?.includes(slotPositionValue) && (
                <option value={slotPositionValue}>
                  Slot {slotPositionValue}U {isSlotLocked ? '(Selected)' : '(Current)'}
                </option>
              )}
              {slots?.available?.map((slot) => (
                <option key={slot} value={slot}>
                  Slot {slot}U
                </option>
              ))}
            </select>
            {slots && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Available: {slots.availableCount} | Occupied: {slots.occupiedCount} of {slots.total}
                {isSlotLocked && <span className="ml-2 font-semibold">🔒 Slot locked</span>}
              </p>
            )}
          </>
        ) : (
          <Input
            id="slot_position"
            type="number"
            placeholder="e.g., 1"
            disabled={true}
            className="bg-gray-100 dark:bg-gray-800"
          />
        )}
        {errors.slot_position && <FormMessage>{errors.slot_position.message}</FormMessage>}
      </FormField>

      <FormField>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Server-01"
          disabled={isSubmitting || isLoading}
          {...register('name')}
        />
        {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
      </FormField>

      {/* Type Dropdown Element */}
      <FormField>
        <Label htmlFor="type">Type *</Label>
        <Select
          id="type"
          {...register('type')}
        >
          <option value="">Select hardware profile configuration</option>
          {EQUIPMENT_TYPES.map((typeOption) => (
            <option key={typeOption.value} value={typeOption.value}>
              {typeOption.label}
            </option>
          ))}
        </Select>
        {errors.type && <FormMessage>{errors.type.message}</FormMessage>}
      </FormField>


{/* 
      <FormField>
        <Label htmlFor="model">Model *</Label>
        <Input
          id="model"
          placeholder="e.g., Oracle X9-2"
          disabled={isSubmitting || isLoading}
          {...register('model')}
        />
        {errors.model && <FormMessage>{errors.model.message}</FormMessage>}
      </FormField>

      <FormField>
        <Label htmlFor="serial_number">Serial Number</Label>
        <Input
          id="serial_number"
          placeholder="e.g., SN-12345678"
          disabled={isSubmitting || isLoading}
          {...register('serial_number')}
        />
        {errors.serial_number && (
          <FormMessage>{errors.serial_number.message}</FormMessage>
        )}
      </FormField>

      <FormField>
        <Label htmlFor="status">Status *</Label>
        <Input
          id="status"
          placeholder="e.g., STABLE, WARNING, CRITICAL"
          disabled={isSubmitting || isLoading}
          {...register('status')}
        />
        {errors.status && <FormMessage>{errors.status.message}</FormMessage>}
      </FormField>
*/}
      <div className="flex gap-2 justify-end pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || isLoading || mutation.isPending}
        >
          {isSubmitting || mutation.isPending ? 'Saving...' : isEditing ? 'Update Equipment' : 'Create Equipment'}
        </Button>
      </div>
    </Form>
  );
}
