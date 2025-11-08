import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Video, Camera, Sparkles } from 'lucide-react';

interface AppointmentFormProps {
  selectedDate: Date | null;
  onAppointmentCreated: () => void;
}

export function AppointmentForm({ selectedDate, onAppointmentCreated }: AppointmentFormProps) {
  const [serviceType, setServiceType] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !serviceType || !time) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: time,
          service_type: serviceType,
          notes: notes || null,
        });

      if (error) {
        // Custom error messages based on database validation
        if (error.message.includes('Quintas-feiras')) {
          toast.error('Quintas-feiras não estão disponíveis para agendamento');
        } else if (error.message.includes('Fins de semana')) {
          toast.error('Fins de semana não estão disponíveis');
        } else if (error.message.includes('Horário fora do expediente')) {
          toast.error('Horário fora do expediente. Funcionamento: Segunda a Sexta, 8h às 18h');
        } else if (error.message.includes('24 horas')) {
          toast.error('Agendamentos devem ser feitos com pelo menos 24 horas de antecedência');
        } else if (error.message.includes('Limite de 2 captações')) {
          toast.error('Limite de 2 captações por dia atingido. Escolha outra data.');
        } else if (error.message.includes('horário já está reservado')) {
          toast.error('Este horário já está reservado. Escolha outro horário.');
        } else {
          toast.error('Erro ao criar agendamento');
        }
        console.error('Error creating appointment:', error);
      } else {
        toast.success('Agendamento criado com sucesso!');
        setServiceType('');
        setTime('');
        setNotes('');
        onAppointmentCreated();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedDate) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-accent-foreground" />
          </div>
          <p className="text-muted-foreground">
            Selecione uma data no calendário para criar um agendamento
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Novo Agendamento</CardTitle>
        <CardDescription>
          {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="service-type">Tipo de Serviço *</Label>
            <Select value={serviceType} onValueChange={setServiceType} required>
              <SelectTrigger id="service-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    <span>Vídeo</span>
                  </div>
                </SelectItem>
                <SelectItem value="photo">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span>Fotografia</span>
                  </div>
                </SelectItem>
                <SelectItem value="both">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Vídeo + Fotografia</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Horário *</Label>
            <Select value={time} onValueChange={setTime} required>
              <SelectTrigger id="time">
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Adicione detalhes sobre a captação..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Confirmar Agendamento'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
