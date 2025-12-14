"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  name: string;
  email: string;
  gender: string;
  age: number | null;
  country: string;
  grade: string;
}

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" }
];

const GRADES = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
  "University Year 1", "University Year 2", "University Year 3", "University Year 4",
  "Graduate Student", "Other"
];

const COUNTRIES = [
  // African Countries
  { value: "nigeria", label: "Nigeria" },
  { value: "ghana", label: "Ghana" },
  { value: "kenya", label: "Kenya" },
  { value: "south_africa", label: "South Africa" },
  { value: "ethiopia", label: "Ethiopia" },
  { value: "egypt", label: "Egypt" },
  { value: "morocco", label: "Morocco" },
  { value: "uganda", label: "Uganda" },
  { value: "tanzania", label: "Tanzania" },
  { value: "algeria", label: "Algeria" },
  { value: "sudan", label: "Sudan" },
  { value: "angola", label: "Angola" },
  { value: "mozambique", label: "Mozambique" },
  { value: "madagascar", label: "Madagascar" },
  { value: "cameroon", label: "Cameroon" },
  { value: "cote_divoire", label: "Côte d'Ivoire" },
  { value: "niger", label: "Niger" },
  { value: "mali", label: "Mali" },
  { value: "burkina_faso", label: "Burkina Faso" },
  { value: "chad", label: "Chad" },
  { value: "somalia", label: "Somalia" },
  { value: "central_african_republic", label: "Central African Republic" },
  { value: "mauritania", label: "Mauritania" },
  { value: "eritrea", label: "Eritrea" },
  { value: "gambia", label: "Gambia" },
  { value: "guinea_bissau", label: "Guinea-Bissau" },
  { value: "liberia", label: "Liberia" },
  { value: "sierra_leone", label: "Sierra Leone" },
  { value: "togo", label: "Togo" },
  { value: "benin", label: "Benin" },
  { value: "rwanda", label: "Rwanda" },
  { value: "burundi", label: "Burundi" },
  { value: "equatorial_guinea", label: "Equatorial Guinea" },
  { value: "gabon", label: "Gabon" },
  { value: "congo", label: "Congo" },
  { value: "democratic_republic_congo", label: "Democratic Republic of Congo" },
  { value: "sao_tome_and_principe", label: "São Tomé and Príncipe" },
  { value: "seychelles", label: "Seychelles" },
  { value: "comoros", label: "Comoros" },
  { value: "mauritius", label: "Mauritius" },
  { value: "cape_verde", label: "Cape Verde" },
  { value: "djibouti", label: "Djibouti" },
  { value: "namibia", label: "Namibia" },
  { value: "botswana", label: "Botswana" },
  { value: "zimbabwe", label: "Zimbabwe" },
  { value: "zambia", label: "Zambia" },
  { value: "malawi", label: "Malawi" },
  { value: "lesotho", label: "Lesotho" },
  { value: "eswatini", label: "Eswatini" },
  { value: "guinea", label: "Guinea" },
  { value: "senegal", label: "Senegal" },
  { value: "tunisia", label: "Tunisia" },
  { value: "libya", label: "Libya" },
  { value: "western_sahara", label: "Western Sahara" },
  // Other Major Countries
  { value: "united_states", label: "United States" },
  { value: "united_kingdom", label: "United Kingdom" },
  { value: "canada", label: "Canada" },
  { value: "australia", label: "Australia" },
  { value: "germany", label: "Germany" },
  { value: "france", label: "France" },
  { value: "italy", label: "Italy" },
  { value: "spain", label: "Spain" },
  { value: "netherlands", label: "Netherlands" },
  { value: "belgium", label: "Belgium" },
  { value: "switzerland", label: "Switzerland" },
  { value: "austria", label: "Austria" },
  { value: "sweden", label: "Sweden" },
  { value: "norway", label: "Norway" },
  { value: "denmark", label: "Denmark" },
  { value: "finland", label: "Finland" },
  { value: "poland", label: "Poland" },
  { value: "czech_republic", label: "Czech Republic" },
  { value: "hungary", label: "Hungary" },
  { value: "romania", label: "Romania" },
  { value: "bulgaria", label: "Bulgaria" },
  { value: "greece", label: "Greece" },
  { value: "portugal", label: "Portugal" },
  { value: "ireland", label: "Ireland" },
  { value: "new_zealand", label: "New Zealand" },
  { value: "japan", label: "Japan" },
  { value: "south_korea", label: "South Korea" },
  { value: "china", label: "China" },
  { value: "india", label: "India" },
  { value: "pakistan", label: "Pakistan" },
  { value: "bangladesh", label: "Bangladesh" },
  { value: "sri_lanka", label: "Sri Lanka" },
  { value: "nepal", label: "Nepal" },
  { value: "bhutan", label: "Bhutan" },
  { value: "myanmar", label: "Myanmar" },
  { value: "thailand", label: "Thailand" },
  { value: "vietnam", label: "Vietnam" },
  { value: "cambodia", label: "Cambodia" },
  { value: "laos", label: "Laos" },
  { value: "malaysia", label: "Malaysia" },
  { value: "singapore", label: "Singapore" },
  { value: "indonesia", label: "Indonesia" },
  { value: "philippines", label: "Philippines" },
  { value: "taiwan", label: "Taiwan" },
  { value: "hong_kong", label: "Hong Kong" },
  { value: "macau", label: "Macau" },
  { value: "mongolia", label: "Mongolia" },
  { value: "kazakhstan", label: "Kazakhstan" },
  { value: "uzbekistan", label: "Uzbekistan" },
  { value: "kyrgyzstan", label: "Kyrgyzstan" },
  { value: "tajikistan", label: "Tajikistan" },
  { value: "turkmenistan", label: "Turkmenistan" },
  { value: "afghanistan", label: "Afghanistan" },
  { value: "iran", label: "Iran" },
  { value: "iraq", label: "Iraq" },
  { value: "syria", label: "Syria" },
  { value: "lebanon", label: "Lebanon" },
  { value: "jordan", label: "Jordan" },
  { value: "israel", label: "Israel" },
  { value: "palestine", label: "Palestine" },
  { value: "saudi_arabia", label: "Saudi Arabia" },
  { value: "yemen", label: "Yemen" },
  { value: "oman", label: "Oman" },
  { value: "united_arab_emirates", label: "United Arab Emirates" },
  { value: "qatar", label: "Qatar" },
  { value: "kuwait", label: "Kuwait" },
  { value: "bahrain", label: "Bahrain" },
  { value: "turkey", label: "Turkey" },
  { value: "cyprus", label: "Cyprus" },
  { value: "georgia", label: "Georgia" },
  { value: "armenia", label: "Armenia" },
  { value: "azerbaijan", label: "Azerbaijan" },
  { value: "russia", label: "Russia" },
  { value: "ukraine", label: "Ukraine" },
  { value: "belarus", label: "Belarus" },
  { value: "moldova", label: "Moldova" },
  { value: "lithuania", label: "Lithuania" },
  { value: "latvia", label: "Latvia" },
  { value: "estonia", label: "Estonia" },
  { value: "slovakia", label: "Slovakia" },
  { value: "slovenia", label: "Slovenia" },
  { value: "croatia", label: "Croatia" },
  { value: "serbia", label: "Serbia" },
  { value: "montenegro", label: "Montenegro" },
  { value: "bosnia_and_herzegovina", label: "Bosnia and Herzegovina" },
  { value: "north_macedonia", label: "North Macedonia" },
  { value: "albania", label: "Albania" },
  { value: "kosovo", label: "Kosovo" },
  { value: "malta", label: "Malta" },
  { value: "iceland", label: "Iceland" },
  { value: "luxembourg", label: "Luxembourg" },
  { value: "liechtenstein", label: "Liechtenstein" },
  { value: "monaco", label: "Monaco" },
  { value: "andorra", label: "Andorra" },
  { value: "san_marino", label: "San Marino" },
  { value: "vatican_city", label: "Vatican City" },
  { value: "brazil", label: "Brazil" },
  { value: "argentina", label: "Argentina" },
  { value: "chile", label: "Chile" },
  { value: "peru", label: "Peru" },
  { value: "colombia", label: "Colombia" },
  { value: "venezuela", label: "Venezuela" },
  { value: "ecuador", label: "Ecuador" },
  { value: "bolivia", label: "Bolivia" },
  { value: "paraguay", label: "Paraguay" },
  { value: "uruguay", label: "Uruguay" },
  { value: "guyana", label: "Guyana" },
  { value: "suriname", label: "Suriname" },
  { value: "french_guiana", label: "French Guiana" },
  { value: "mexico", label: "Mexico" },
  { value: "guatemala", label: "Guatemala" },
  { value: "belize", label: "Belize" },
  { value: "el_salvador", label: "El Salvador" },
  { value: "honduras", label: "Honduras" },
  { value: "nicaragua", label: "Nicaragua" },
  { value: "costa_rica", label: "Costa Rica" },
  { value: "panama", label: "Panama" },
  { value: "cuba", label: "Cuba" },
  { value: "jamaica", label: "Jamaica" },
  { value: "haiti", label: "Haiti" },
  { value: "dominican_republic", label: "Dominican Republic" },
  { value: "puerto_rico", label: "Puerto Rico" },
  { value: "trinidad_and_tobago", label: "Trinidad and Tobago" },
  { value: "barbados", label: "Barbados" },
  { value: "bahamas", label: "Bahamas" },
  { value: "grenada", label: "Grenada" },
  { value: "saint_lucia", label: "Saint Lucia" },
  { value: "saint_vincent_and_the_grenadines", label: "Saint Vincent and the Grenadines" },
  { value: "antigua_and_barbuda", label: "Antigua and Barbuda" },
  { value: "dominica", label: "Dominica" },
  { value: "saint_kitts_and_nevis", label: "Saint Kitts and Nevis" },
  { value: "other", label: "Other" }
];

export default function ProfileUpdateForm() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    gender: "",
    age: null,
    country: "",
    grade: ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gradeEdited, setGradeEdited] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchUserProfile();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          name: data.name || "",
          email: data.email || "",
          gender: data.gender || "",
          age: data.age || null,
          country: data.country || "",
          grade: data.grade || ""
        });
        // Check if grade was previously set
        setGradeEdited(!!data.grade);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
          gender: profileData.gender,
          age: profileData.age,
          country: profileData.country,
          grade: gradeEdited ? undefined : profileData.grade // Only send grade if not previously edited
        })
      });

      if (response.ok) {
        const updatedData = await response.json();
        
        // Update session with new data
        await update({
          ...session,
          user: {
            ...session?.user,
            name: updatedData.name
          }
        });

        // Mark grade as edited if it was set
        if (profileData.grade && !gradeEdited) {
          setGradeEdited(true);
        }

        toast({
          title: "Profile Updated",
          description: "Your profile has been saved successfully!",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGradeChange = (value: string) => {
    if (!gradeEdited) {
      setProfileData(prev => ({ ...prev, grade: value }));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profileData.email}
              disabled
              className="bg-gray-50 dark:bg-gray-800"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select 
              value={profileData.gender || undefined} 
              onValueChange={(value) => setProfileData(prev => ({ ...prev, gender: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((gender) => (
                  <SelectItem key={gender.value} value={gender.value}>
                    {gender.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="1"
              max="120"
              value={profileData.age || ""}
              onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : null }))}
              placeholder="Enter your age"
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select 
              value={profileData.country || undefined} 
              onValueChange={(value) => setProfileData(prev => ({ ...prev, country: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grade */}
          <div className="space-y-2">
            <Label htmlFor="grade">Grade Level</Label>
            <Select 
              value={profileData.grade || undefined} 
              onValueChange={handleGradeChange}
            >
              <SelectTrigger 
                disabled={gradeEdited}
                className={gradeEdited ? "bg-gray-50 dark:bg-gray-800" : ""}
              >
                <SelectValue placeholder={gradeEdited ? "Grade cannot be changed" : "Select your grade"} />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {gradeEdited && (
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                <span>Grade can only be set once and cannot be changed</span>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 