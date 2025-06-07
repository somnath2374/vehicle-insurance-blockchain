
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Shield } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setCurrentUser } = useBlockchain();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'admin' && password === 'admin123') {
      const adminUser = {
        id: 'admin_1',
        name: 'System Administrator',
        role: 'Admin' as const,
        organization: 'System Administration',
        publicKey: 'admin_public_key',
        isActive: true
      };
      
      setCurrentUser(adminUser);
      console.log('Admin logged in successfully');
    } else {
      setError('Invalid credentials. Use admin/admin123');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-red-700">
          Admin Login
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <Button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <Shield className="w-4 h-4 mr-2" />
            Login as Admin
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Demo credentials: admin / admin123
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminLogin;
