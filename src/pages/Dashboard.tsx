import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/Calendar';
import { AppointmentForm } from '@/components/AppointmentForm';
import { AppointmentsList } from '@/components/AppointmentsList';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  notes: string | null;
  status: string;
}

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'scheduled')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) {
        toast.error('Erro ao carregar agendamentos');
        console.error('Error fetching appointments:', error);
      } else {
        setAppointments(data || []);
        
        // Extract booked dates for calendar
        const dates = (data || []).map(apt => new Date(apt.appointment_date));
        setBookedDates(dates);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleAppointmentChange = () => {
    fetchAppointments();
    setSelectedDate(null);
  };

  if (loading || loadingAppointments) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">IDLAB Agendamentos</h1>
                <p className="text-sm text-muted-foreground">Sistema de Captação</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={signOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Calendar & Form */}
          <div className="space-y-6">
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              bookedDates={bookedDates}
            />
            <AppointmentForm
              selectedDate={selectedDate}
              onAppointmentCreated={handleAppointmentChange}
            />
          </div>

          {/* Right Column - Appointments List */}
          <div>
            <AppointmentsList
              appointments={appointments}
              onAppointmentDeleted={handleAppointmentChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
