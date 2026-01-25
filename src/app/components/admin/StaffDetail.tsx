import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  ChevronLeft,
  Camera,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  User,
  Briefcase,
  DollarSign,
  Award,
  Clock,
  MapPin,
  Save,
  X,
  MoreHorizontal,
  Star,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { format } from "date-fns";
import { cn } from "../ui/utils";
import { Calendar } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";

interface StaffDetailProps {
  staff: any;
  isCreating?: boolean;
  onBack: () => void;
  onSave: (data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, "");
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return dateString;
  const dateObj = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
  );
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

interface ProfileFieldProps {
  icon: any;
  label: string;
  value: any;
  field: string;
  type?: string;
  required?: boolean;
  prefix?: string;
  isEditing: boolean;
  onChange: (value: any) => void;
  nameInputRef?: React.RefObject<HTMLInputElement>;
}

const ProfileField = ({
  icon: Icon,
  label,
  value,
  field,
  type = "text",
  required = false,
  prefix = "",
  isEditing,
  onChange,
  nameInputRef,
}: ProfileFieldProps) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let newValue = e.target.value;
    if (field.toLowerCase().includes("phone")) {
      const formatted = formatPhoneNumber(newValue);
      onChange(formatted);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors px-4 -mx-4">
      <div className="flex items-center gap-3 w-1/3">
        <div
          className={`p-1.5 rounded-full ${isEditing ? "bg-orange-50 text-orange-500" : "bg-white border border-gray-100 text-gray-400"}`}
        >
          <Icon className="w-3.5 h-3.5 stroke-[1.5]" />
        </div>
        <span className="text-sm font-medium text-gray-500">
          {label}{" "}
          {required && isEditing && (
            <span className="text-red-500">*</span>
          )}
        </span>
      </div>
      <div className="w-2/3 text-right">
        {isEditing ? (
          <div className="relative flex justify-end w-full">
            {type === "date" ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-right font-normal border-gray-200 bg-gray-50/50 hover:bg-white justify-end",
                      !value && "text-muted-foreground",
                    )}
                  >
                    {value ? (
                      (() => {
                        const [y, m, d] = value
                          .split("-")
                          .map(Number);
                        const date = new Date(y, m - 1, d);
                        return format(date, "MMM dd, yyyy");
                      })()
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="end"
                >
                  <Calendar
                    mode="single"
                    selected={
                      value
                        ? (() => {
                            const [y, m, d] = value
                              .split("-")
                              .map(Number);
                            return new Date(y, m - 1, d);
                          })()
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(
                          date.getMonth() + 1,
                        ).padStart(2, "0");
                        const day = String(
                          date.getDate(),
                        ).padStart(2, "0");
                        onChange(`${year}-${month}-${day}`);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <>
                {prefix && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm z-10">
                    {prefix}
                  </span>
                )}
                <Input
                  ref={field === "name" ? nameInputRef : null}
                  value={value}
                  onChange={handleInputChange}
                  className={`text-right h-8 text-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500 bg-gray-50/50 ${prefix ? "pl-14" : ""}`}
                  type={type}
                  placeholder={label}
                  maxLength={
                    field.toLowerCase().includes("phone")
                      ? 14
                      : undefined
                  }
                />
              </>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-900 font-semibold break-words">
            {prefix}
            {type === "date" ? formatDate(value) : value || "-"}
          </span>
        )}
      </div>
    </div>
  );
};

export default function StaffDetail({
  staff,
  isCreating = false,
  onBack,
  onSave,
  onDelete,
}: StaffDetailProps) {
  const [isEditing, setIsEditing] = useState(isCreating);
  const [formData, setFormData] = useState({
    ...staff,
    commissionRate: staff.commissionRate
      ? (staff.commissionRate * 100).toString()
      : "60", // Display as 0-100
    rating: staff.rating || "",
    skillLevel: staff.skillLevel || "senior",
    specialties: staff.specialties || [],
    workingDays: staff.workingDays || [],
  });
  const [loading, setLoading] = useState(false);

  // Focus name on create
  const nameInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isCreating && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isCreating]);

  const handleSave = async () => {
    // Validation
    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.role
    ) {
      toast.error(
        "Please fill in all required fields (marked with *)",
      );
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        commissionRate: formData.commissionRate, // Pass the value (e.g. "60") directly
      };

      await onSave(dataToSave);
      if (!isCreating) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData((prev: any) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(
            (s: string) => s !== specialty,
          )
        : [...prev.specialties, specialty],
    }));
  };

  const toggleWorkingDay = (day: string) => {
    setFormData((prev: any) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d: string) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto min-h-[80vh] animate-in slide-in-from-right-8 duration-300 font-sans">
      {/* Navbar / Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="hover:bg-gray-100 rounded-full h-10 w-10"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            {isCreating ? "New Profile" : "Staff Profile"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Action Button */}
          {!isCreating && (
            <Button
              variant={isEditing ? "default" : "outline"}
              className={`rounded-full px-6 transition-all ${isEditing ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md" : "text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900"}`}
              onClick={() =>
                isEditing ? handleSave() : setIsEditing(true)
              }
              disabled={loading}
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          )}
          {isCreating && (
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full px-8 shadow-lg shadow-orange-100"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Staff"}
            </Button>
          )}
        </div>
      </div>

      <div className="md:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN - Avatar & Stats (Desktop: 4 columns) */}
          <div className="lg:col-span-4 space-y-6 order-1">
            {/* Profile Card */}
            <Card className="border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden rounded-3xl bg-white">
              <div className="h-40 bg-[#FFF5EB]"></div>
              <div className="px-6 pb-8 -mt-16 flex flex-col items-center text-center">
                <div className="relative group mb-5">
                  <Avatar className="w-32 h-32 border-[6px] border-white shadow-sm cursor-pointer bg-white">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`}
                    />
                    <AvatarFallback className="bg-red-600 text-white text-3xl font-medium tracking-wider">
                      {getInitials(
                        formData.name || "New Staff",
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute bottom-1 right-1 bg-gray-900 text-white p-2.5 rounded-full border-4 border-white shadow-md hover:bg-black transition-colors">
                      <Camera className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-8 w-full">
                  <div className="space-y-1">
                    {isEditing ? (
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400 font-medium uppercase tracking-wider block text-center">
                          Full Name{" "}
                          <span className="text-red-500">
                            *
                          </span>
                        </Label>
                        <Input
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              name: e.target.value,
                            })
                          }
                          className="text-center text-2xl font-serif font-bold text-gray-900 border-gray-200 bg-gray-50/50 h-10"
                          placeholder="Full Name"
                        />
                      </div>
                    ) : (
                      <h2 className="text-2xl font-serif font-bold text-gray-900">
                        {formData.name || "New Staff Member"}
                      </h2>
                    )}
                  </div>

                  <div className="space-y-1">
                    {isEditing ? (
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400 font-medium uppercase tracking-wider block text-center">
                          Role{" "}
                          <span className="text-red-500">
                            *
                          </span>
                        </Label>
                        <Input
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              role: e.target.value,
                            })
                          }
                          className="text-center text-sm font-medium uppercase tracking-wide border-gray-200 bg-gray-50/50"
                          placeholder="Job Title"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">
                        {formData.role || "Role"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    {isEditing ? (
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-400 font-medium uppercase tracking-wider block text-center">
                          Nickname
                        </Label>
                        <Input
                          value={formData.nickname}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nickname: e.target.value,
                            })
                          }
                          className="text-center text-sm text-gray-500 border-gray-200 bg-gray-50/50"
                          placeholder="Nickname (Optional)"
                        />
                      </div>
                    ) : (
                      formData.nickname && (
                        <p className="text-sm text-gray-400 italic">
                          "{formData.nickname}"
                        </p>
                      )
                    )}
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-0 w-full border-t border-gray-100 pt-6">
                  <div className="text-center px-2">
                    <div className="text-lg font-bold text-gray-900">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <Input
                            value={formData.commissionRate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                commissionRate: e.target.value,
                              })
                            }
                            type="number"
                            className="w-full h-8 text-center text-sm p-0 border border-gray-200 rounded-md bg-white"
                          />
                        </div>
                      ) : (
                        `${formData.commissionRate}%`
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">
                      Comm.
                    </div>
                  </div>
                  <div className="text-center border-l border-gray-100 px-2">
                    <div className="text-lg font-bold text-gray-900">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="text-xs text-gray-400">
                            $
                          </span>
                          <Input
                            value={formData.baseHourlyRate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                baseHourlyRate: e.target.value,
                              })
                            }
                            type="number"
                            className="w-full h-8 text-center text-sm p-0 border border-gray-200 rounded-md bg-white"
                          />
                        </div>
                      ) : (
                        `$${formData.baseHourlyRate}`
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">
                      Hourly
                    </div>
                  </div>
                  <div className="text-center border-l border-gray-100 px-2">
                    <div className="text-lg font-bold text-gray-900">
                      {isEditing ? (
                        <Select
                          value={formData.employmentType}
                          onValueChange={(v) =>
                            setFormData({
                              ...formData,
                              employmentType: v,
                            })
                          }
                        >
                          <SelectTrigger className="h-8 border-gray-200 bg-white justify-center text-sm font-bold p-0 px-2 shadow-none rounded-md">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="W2">
                              W2
                            </SelectItem>
                            <SelectItem value="1099">
                              1099
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        formData.employmentType
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">
                      Type
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Availability */}
            <Card className="border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl bg-white">
              <CardHeader className="py-3 px-5">
                <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <div className="flex justify-between gap-1">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => {
                    const isActive =
                      formData.workingDays.includes(day);
                    return (
                      <button
                        key={day}
                        disabled={!isEditing}
                        onClick={() => toggleWorkingDay(day)}
                        className={`
                                 h-9 w-9 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200
                                 ${
                                   isActive
                                     ? "bg-gray-900 text-white shadow-md scale-110"
                                     : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                 }
                                 ${!isEditing && !isActive ? "opacity-50" : "opacity-100"}
                              `}
                        title={day}
                      >
                        {day.substring(0, 1)}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card className="border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl bg-white">
              <CardHeader className="py-3 px-5">
                <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Specialties
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    // 1. Define Default Skills
                    const defaultSkills = [
                      "Manicure",
                      "Pedicure",
                      "Gel Polish",
                      "Acrylic",
                      "Dip Powder",
                      "Nail Art",
                      "Nail Extension",
                      "Spa Treatment",
                    ];

                    // 2. Get current staff skills (clean up "+" suffix) to ensure we show everything
                    const staffSkills = (
                      formData.specialties || []
                    ).map((s: string) => s.replace("+", ""));

                    // 3. Merge and Unique
                    const allSkills = Array.from(
                      new Set([
                        ...defaultSkills,
                        ...staffSkills,
                      ]),
                    );

                    return (
                      <>
                        {allSkills.map((specialty) => {
                          const isLevel1 =
                            formData.specialties.includes(
                              specialty,
                            );
                          const isLevel2 =
                            formData.specialties.includes(
                              `${specialty}+`,
                            );
                          const isActive = isLevel1 || isLevel2;

                          const handleToggle = () => {
                            if (!isEditing) return;

                            setFormData((prev: any) => {
                              const currentList =
                                prev.specialties || [];
                              let newList = [...currentList];

                              if (isLevel1) {
                                // Good -> Great
                                newList = newList.filter(
                                  (s: string) =>
                                    s !== specialty,
                                );
                                newList.push(`${specialty}+`);
                              } else if (isLevel2) {
                                // Great -> Off
                                newList = newList.filter(
                                  (s: string) =>
                                    s !== `${specialty}+`,
                                );
                              } else {
                                // Off -> Good
                                newList.push(specialty);
                              }

                              return {
                                ...prev,
                                specialties: newList,
                              };
                            });
                          };

                          return (
                            <Badge
                              key={specialty}
                              variant={
                                isActive ? "default" : "outline"
                              }
                              className={`
                                  py-1.5 px-3.5 rounded-full text-xs font-medium cursor-pointer transition-all select-none
                                  ${
                                    isLevel2
                                      ? "bg-orange-600 text-white border-orange-600 hover:bg-orange-700 shadow-md ring-2 ring-orange-100"
                                      : isLevel1
                                        ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 shadow-sm"
                                        : "border-gray-100 text-gray-500 bg-gray-50 hover:border-gray-200 hover:bg-gray-100"
                                  }
                                `}
                              onClick={handleToggle}
                            >
                              {specialty}
                              {isLevel1 && (
                                <span className="ml-1.5 text-[10px] opacity-70 font-normal">
                                  • Good
                                </span>
                              )}
                              {isLevel2 && (
                                <span className="ml-1.5 text-[10px] opacity-90 font-bold">
                                  • Great
                                </span>
                              )}
                            </Badge>
                          );
                        })}

                        {/* 4. Add Custom Skill Button */}
                        {isEditing && (
                          <Badge
                            variant="outline"
                            className="py-1.5 px-3.5 rounded-full text-xs font-medium cursor-pointer border-dashed border-gray-300 text-gray-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50 transition-all"
                            onClick={() => {
                              const newSkill = prompt(
                                "Enter new skill name (e.g., Waxing):",
                              );
                              if (newSkill && newSkill.trim()) {
                                const formattedSkill =
                                  newSkill.trim();
                                // Add immediately as "Good" level
                                setFormData((prev: any) => ({
                                  ...prev,
                                  specialties: [
                                    ...(prev.specialties || []),
                                    formattedSkill,
                                  ],
                                }));
                              }
                            }}
                          >
                            + Add Custom
                          </Badge>
                        )}
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Personal Info (Desktop: 8 columns) */}
          <div className="lg:col-span-8 space-y-6 order-2">
            {/* Contact Information Card */}
            <Card className="border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden rounded-3xl bg-white">
              <CardHeader className="border-b border-gray-50 p-[16px] pt-[16px] pr-[16px] pb-[24px] pl-[16px]">
                <CardTitle className="text-lg font-bold text-gray-900">
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
                <div className="space-y-0">
                  <ProfileField
                    icon={Phone}
                    label="Phone Number"
                    value={formData.phone}
                    field="phone"
                    required
                    isEditing={isEditing}
                    onChange={(val) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        phone: val,
                      }))
                    }
                  />
                  <ProfileField
                    icon={Mail}
                    label="Email Address"
                    value={formData.email}
                    field="email"
                    required
                    isEditing={isEditing}
                    onChange={(val) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        email: val,
                      }))
                    }
                  />
                  <ProfileField
                    icon={User}
                    label="Emergency Contact"
                    value={formData.emergencyContactName}
                    field="emergencyContactName"
                    prefix="Name: "
                    isEditing={isEditing}
                    onChange={(val) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        emergencyContactName: val,
                      }))
                    }
                  />
                  <ProfileField
                    icon={Phone}
                    label="Emergency Phone"
                    value={formData.emergencyContactPhone}
                    field="emergencyContactPhone"
                    prefix="Phone: "
                    isEditing={isEditing}
                    onChange={(val) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        emergencyContactPhone: val,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Details Card */}
            <Card className="border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden rounded-3xl bg-white">
              <CardHeader className="border-b border-gray-50 p-[16px]">
                <CardTitle className="text-lg font-bold text-gray-900">
                  Professional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
                <div className="space-y-0">
                  {/* Skill Level Selection */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors px-4 -mx-4">
                    <div className="flex items-center gap-3 w-1/3">
                      <div
                        className={`p-1.5 rounded-full ${isEditing ? "bg-orange-50 text-orange-500" : "bg-white border border-gray-100 text-gray-400"}`}
                      >
                        <Award className="w-3.5 h-3.5 stroke-[1.5]" />
                      </div>
                      <span className="text-sm font-medium text-gray-500">
                        Skill Level
                      </span>
                    </div>
                    <div className="w-2/3 text-right">
                      {isEditing ? (
                        <div className="relative flex justify-end w-full">
                          <Select
                            value={formData.skillLevel}
                            onValueChange={(val) =>
                              setFormData({
                                ...formData,
                                skillLevel: val,
                              })
                            }
                          >
                            <SelectTrigger className="w-full text-right h-8 border-gray-200 bg-gray-50/50 focus:ring-orange-500 justify-end">
                              <SelectValue placeholder="Select Level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="junior">
                                Junior
                              </SelectItem>
                              <SelectItem value="senior">
                                Senior
                              </SelectItem>
                              <SelectItem value="master">
                                Master
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-900 font-semibold uppercase">
                          {formData.skillLevel || "-"}
                        </span>
                      )}
                    </div>
                  </div>

                  <ProfileField
                    icon={Award}
                    label="License Number"
                    value={formData.licenseNumber}
                    field="licenseNumber"
                    required
                    isEditing={isEditing}
                    onChange={(val) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        licenseNumber: val,
                      }))
                    }
                  />
                  <ProfileField
                    icon={Star}
                    label="Rating (0-5)"
                    value={formData.rating}
                    field="rating"
                    type="number"
                    isEditing={isEditing}
                    onChange={(val) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        rating: val,
                      }))
                    }
                  />
                  <ProfileField
                    icon={CalendarIcon}
                    label="Date Hired"
                    value={formData.hireDate}
                    field="hireDate"
                    type="date"
                    required
                    isEditing={isEditing}
                    onChange={(val) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        hireDate: val,
                      }))
                    }
                  />
                  <ProfileField
                    icon={DollarSign}
                    label="Tip Split (%)"
                    value={formData.tipSplit}
                    field="tipSplit"
                    isEditing={isEditing}
                    onChange={(val) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        tipSplit: val,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delete Button */}
            {!isCreating && onDelete && (
              <div className="pt-4 flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to delete this staff member? This action cannot be undone.",
                      )
                    ) {
                      onDelete(staff.id);
                    }
                  }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 font-medium px-6"
                >
                  Delete Staff Member
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}