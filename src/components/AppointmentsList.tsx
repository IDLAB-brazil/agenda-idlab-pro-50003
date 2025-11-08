import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Video, Camera, Sparkles, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  notes: string | null;
  status: string;
}

interface AppointmentsListProps {
  appointments: Appointment[];
  onAppointmentDeleted: () => void;
}

export function AppointmentsList({ appointments, onAppointmentDeleted }: AppointmentsListProps) {
  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'photo':
        return <Camera className="w-4 h-4" />;
      case 'both':
        return <Sparkles className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getServiceLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'Vídeo';
      case 'photo':
        return 'Fotografia';
      case 'both':
        return 'Vídeo + Foto';
      default:
        return type;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Erro ao cancelar agendamento');
        console.error('Error deleting appointment:', error);
      } else {
        toast.success('Agendamento cancelado com sucesso');
        onAppointmentDeleted();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao cancelar agendamento');
    }
  };

  if (appointments.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <CalendarIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Você ainda não tem agendamentos. Crie seu primeiro agendamento no calendário!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Seus Agendamentos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="p-4 rounded-lg border border-border bg-card hover:shadow-soft transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                    {getServiceIcon(appointment.service_type)}
                  </div>
                  <div>
                    <p className="font-semibold">{getServiceLabel(appointment.service_type)}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="w-3 h-3" />
                      <span>
                        {format(new Date(appointment.appointment_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{appointment.appointment_time}</span>
                  <Badge variant="secondary" className="ml-2">
                    {appointment.status === 'scheduled' ? 'Agendado' : appointment.status}
                  </Badge>
                </div>

                {appointment.notes && (
                  <p className="text-sm text-muted-foreground border-l-2 border-primary/20 pl-3">
                    {appointment.notes}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(appointment.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
