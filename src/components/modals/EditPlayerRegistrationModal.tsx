
// src/components/modals/EditPlayerRegistrationModal.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import type { PlayerRegistration } from '@/types/playerRegistration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';

interface EditPlayerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: PlayerRegistration | null;
  onSave: (updatedRegistration: PlayerRegistration, newFile?: File | null) => Promise<void>;
  isLoading?: boolean;
}

export default function EditPlayerRegistrationModal({ isOpen, onClose, registration, onSave, isLoading }: EditPlayerRegistrationModalProps) {
  const { toast } = useToast();
  
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [feePaid, setFeePaid] = useState(false);
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [organization, setOrganization] = useState('');
  const [mobile, setMobile] = useState('');
  const [fideRating, setFideRating] = useState<number | ''>(0);
  const [fideId, setFideId] = useState('-');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | undefined>(undefined);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (registration) {
      setPlayerName(registration.playerName);
      setPlayerEmail(registration.playerEmail || '');
      setFeePaid(registration.feePaid);
      setGender(registration.gender || '');
      setDob(registration.dob || '');
      setOrganization(registration.organization || '');
      setMobile(registration.mobile || '');
      setFideRating(registration.fideRating === undefined ? '' : registration.fideRating);
      setFideId(registration.fideId || '-');
      setPaymentScreenshotUrl(registration.paymentScreenshotUrl);
      setSelectedFile(null); // Reset file on new registration load
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [registration]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setPaymentScreenshotUrl(undefined); // Clear existing URL if new file is chosen
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!registration) return;
    if (!playerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Player name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const updatedRegistrationData: PlayerRegistration = {
      ...registration,
      playerName,
      playerEmail,
      feePaid,
      gender,
      dob,
      organization,
      mobile,
      fideRating: Number(fideRating) || 0,
      fideId: fideId || '-',
      // paymentScreenshotUrl will be handled by onSave based on selectedFile
    };
    
    await onSave(updatedRegistrationData, selectedFile);
  };
  
  if (!registration) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Player Registration</DialogTitle>
          <DialogDescription>
            Update details for {registration.playerName} in tournament: {registration.tournamentName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editPlayerName">Player Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="editPlayerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="editPlayerEmail">Player Email</Label>
              <Input
                id="editPlayerEmail"
                type="email"
                value={playerEmail}
                onChange={(e) => setPlayerEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editGender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editDob">Date of Birth</Label>
              <Input
                id="editDob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editOrganization">Organization/School/College</Label>
              <Input
                id="editOrganization"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="editMobile">Mobile Number</Label>
              <Input
                id="editMobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editFideRating">FIDE Rating</Label>
              <Input
                id="editFideRating"
                type="number"
                value={fideRating}
                onChange={(e) => setFideRating(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="editFideId">FIDE ID</Label>
              <Input
                id="editFideId"
                type="text"
                value={fideId}
                onChange={(e) => setFideId(e.target.value)}
              />
            </div>
          </div>
            
          <div>
            <Label htmlFor="editPaymentScreenshotFile">New Payment Screenshot (Optional)</Label>
            <Input
              id="editPaymentScreenshotFile"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="mt-1"
              accept="image/png, image/jpeg, image/gif"
            />
            {selectedFile && <p className="text-sm text-muted-foreground mt-1">New file selected: {selectedFile.name}</p>}
            {!selectedFile && paymentScreenshotUrl && (
                <div className="mt-2 text-sm">
                    Current screenshot: <a href={paymentScreenshotUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View current</a>
                </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Upload a new file to replace the existing screenshot.
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="editFeePaid" 
              checked={feePaid} 
              onCheckedChange={(checked) => setFeePaid(checked as boolean)}
            />
            <Label htmlFor="editFeePaid" className="text-sm font-medium">
              Entry Fee Paid
            </Label>
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
