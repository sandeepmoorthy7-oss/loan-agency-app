import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Calculator, IndianRupee, Percent, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export function Calculators() {
  // EMI Calculator State
  const [loanAmount, setLoanAmount] = useState<string>('500000');
  const [interestRate, setInterestRate] = useState<string>('8.5');
  const [loanTenure, setLoanTenure] = useState<string>('12');
  const [tenureType, setTenureType] = useState<'months' | 'years'>('years');
  const [emi, setEmi] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // FOIR Calculator State
  const [monthlyIncome, setMonthlyIncome] = useState<string>('50000');
  const [existingEmi, setExistingEmi] = useState<string>('0');
  const [proposedEmi, setProposedEmi] = useState<string>('15000');
  const [otherObligations, setOtherObligations] = useState<string>('0');
  const [foir, setFoir] = useState<number>(0);
  const [foirStatus, setFoirStatus] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

  // Calculate EMI
  const calculateEMI = () => {
    const principal = parseFloat(loanAmount) || 0;
    const ratePerMonth = (parseFloat(interestRate) || 0) / 12 / 100;
    const tenureInMonths = tenureType === 'years' 
      ? (parseFloat(loanTenure) || 0) * 12 
      : (parseFloat(loanTenure) || 0);

    if (principal > 0 && ratePerMonth > 0 && tenureInMonths > 0) {
      const emiValue = principal * ratePerMonth * Math.pow(1 + ratePerMonth, tenureInMonths) / 
                      (Math.pow(1 + ratePerMonth, tenureInMonths) - 1);
      const totalAmountValue = emiValue * tenureInMonths;
      const totalInterestValue = totalAmountValue - principal;

      setEmi(emiValue);
      setTotalInterest(totalInterestValue);
      setTotalAmount(totalAmountValue);
    } else {
      setEmi(0);
      setTotalInterest(0);
      setTotalAmount(0);
    }
  };

  // Calculate FOIR
  const calculateFOIR = () => {
    const income = parseFloat(monthlyIncome) || 0;
    const existing = parseFloat(existingEmi) || 0;
    const proposed = parseFloat(proposedEmi) || 0;
    const other = parseFloat(otherObligations) || 0;

    if (income > 0) {
      const totalObligations = existing + proposed + other;
      const foirValue = (totalObligations / income) * 100;
      setFoir(foirValue);

      // Determine FOIR status
      if (foirValue <= 40) {
        setFoirStatus('excellent');
      } else if (foirValue <= 50) {
        setFoirStatus('good');
      } else if (foirValue <= 60) {
        setFoirStatus('fair');
      } else {
        setFoirStatus('poor');
      }
    } else {
      setFoir(0);
    }
  };

  // Auto-calculate on input change
  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, loanTenure, tenureType]);

  useEffect(() => {
    calculateFOIR();
  }, [monthlyIncome, existingEmi, proposedEmi, otherObligations]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getFoirColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getFoirMessage = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'Excellent! Your FOIR is well within acceptable limits. Banks will view your application favorably.';
      case 'good':
        return 'Good! Your FOIR is acceptable for most lenders. You should qualify for the loan.';
      case 'fair':
        return 'Fair. Your FOIR is on the higher side. Some lenders may require additional documentation.';
      case 'poor':
        return 'Poor. Your FOIR exceeds 60%. Consider reducing existing obligations or increasing income.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Calculators</h1>
        <p className="text-gray-500 mt-1">
          Calculate EMI and FOIR to assess loan affordability and eligibility
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="size-5 text-blue-600" />
              <CardTitle className="text-base">EMI Calculator</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              Calculate your Equated Monthly Installment (EMI) based on loan amount, interest rate, and tenure.
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-purple-600" />
              <CardTitle className="text-base">FOIR Calculator</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              Calculate your Fixed Obligation to Income Ratio (FOIR) to check loan eligibility. Ideal FOIR is below 50%.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calculators */}
      <Tabs defaultValue="emi" className="space-y-4">
        <TabsList>
          <TabsTrigger value="emi">
            <Calculator className="size-4 mr-2" />
            EMI Calculator
          </TabsTrigger>
          <TabsTrigger value="foir">
            <Percent className="size-4 mr-2" />
            FOIR Calculator
          </TabsTrigger>
        </TabsList>

        {/* EMI Calculator Tab */}
        <TabsContent value="emi">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
                <CardDescription>Enter your loan information to calculate EMI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount" className="flex items-center gap-2">
                    <IndianRupee className="size-4" />
                    Loan Amount
                  </Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="Enter loan amount"
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-500">{formatCurrency(parseFloat(loanAmount) || 0)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate" className="flex items-center gap-2">
                    <Percent className="size-4" />
                    Annual Interest Rate (%)
                  </Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="Enter interest rate"
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanTenure" className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    Loan Tenure
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      id="loanTenure"
                      type="number"
                      value={loanTenure}
                      onChange={(e) => setLoanTenure(e.target.value)}
                      placeholder="Enter tenure"
                      className="text-lg flex-1"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={tenureType === 'months' ? 'default' : 'outline'}
                        onClick={() => setTenureType('months')}
                        className="px-6"
                      >
                        Months
                      </Button>
                      <Button
                        type="button"
                        variant={tenureType === 'years' ? 'default' : 'outline'}
                        onClick={() => setTenureType('years')}
                        className="px-6"
                      >
                        Years
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {tenureType === 'years' 
                      ? `${loanTenure} years = ${parseFloat(loanTenure) * 12} months`
                      : `${loanTenure} months`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="text-indigo-900">EMI Calculation Results</CardTitle>
                <CardDescription className="text-indigo-700">Your monthly payment breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-indigo-300">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Monthly EMI</p>
                    <p className="text-4xl font-bold text-indigo-600">{formatCurrency(emi)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-indigo-200">
                    <p className="text-xs text-gray-600 mb-1">Principal Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(parseFloat(loanAmount) || 0)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-indigo-200">
                    <p className="text-xs text-gray-600 mb-1">Total Interest</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {formatCurrency(totalInterest)}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                  <p className="text-sm text-gray-600 mb-1">Total Amount Payable</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Payment Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Interest Rate (p.a.)</span>
                      <span className="font-medium">{interestRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Loan Tenure</span>
                      <span className="font-medium">
                        {tenureType === 'years' 
                          ? `${loanTenure} years (${parseFloat(loanTenure) * 12} months)`
                          : `${loanTenure} months`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-gray-600">Interest Percentage</span>
                      <span className="font-medium text-orange-600">
                        {totalAmount > 0 ? ((totalInterest / totalAmount) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* FOIR Calculator Tab */}
        <TabsContent value="foir">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Income & Obligations</CardTitle>
                <CardDescription>Enter your monthly income and existing obligations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome" className="flex items-center gap-2">
                    <IndianRupee className="size-4" />
                    Monthly Income
                  </Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="Enter monthly income"
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-500">{formatCurrency(parseFloat(monthlyIncome) || 0)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="existingEmi" className="flex items-center gap-2">
                    <IndianRupee className="size-4" />
                    Existing EMI/Loans
                  </Label>
                  <Input
                    id="existingEmi"
                    type="number"
                    value={existingEmi}
                    onChange={(e) => setExistingEmi(e.target.value)}
                    placeholder="Enter existing EMI"
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-500">Monthly payments on existing loans</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proposedEmi" className="flex items-center gap-2">
                    <IndianRupee className="size-4" />
                    Proposed Loan EMI
                  </Label>
                  <Input
                    id="proposedEmi"
                    type="number"
                    value={proposedEmi}
                    onChange={(e) => setProposedEmi(e.target.value)}
                    placeholder="Enter proposed EMI"
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-500">EMI for the new loan you're applying for</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherObligations" className="flex items-center gap-2">
                    <IndianRupee className="size-4" />
                    Other Financial Obligations
                  </Label>
                  <Input
                    id="otherObligations"
                    type="number"
                    value={otherObligations}
                    onChange={(e) => setOtherObligations(e.target.value)}
                    placeholder="Enter other obligations"
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-500">Credit card bills, rent, etc.</p>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-900">FOIR Calculation Results</CardTitle>
                <CardDescription className="text-purple-700">Your Fixed Obligation to Income Ratio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-300">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Your FOIR</p>
                    <p className="text-5xl font-bold text-purple-600">{foir.toFixed(1)}%</p>
                    <Badge className={`${getFoirColor(foirStatus)} text-white mt-3`}>
                      {foirStatus.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <Alert className={`border-2 ${
                  foirStatus === 'excellent' ? 'border-green-300 bg-green-50' :
                  foirStatus === 'good' ? 'border-blue-300 bg-blue-50' :
                  foirStatus === 'fair' ? 'border-yellow-300 bg-yellow-50' :
                  'border-red-300 bg-red-50'
                }`}>
                  <AlertCircle className="size-4" />
                  <AlertDescription className="text-sm">
                    {getFoirMessage(foirStatus)}
                  </AlertDescription>
                </Alert>

                {/* Breakdown */}
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Monthly Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Monthly Income</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(parseFloat(monthlyIncome) || 0)}
                      </span>
                    </div>
                    <div className="pt-2 border-t space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Existing EMI</span>
                        <span className="text-sm">{formatCurrency(parseFloat(existingEmi) || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Proposed EMI</span>
                        <span className="text-sm">{formatCurrency(parseFloat(proposedEmi) || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Other Obligations</span>
                        <span className="text-sm">{formatCurrency(parseFloat(otherObligations) || 0)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium text-gray-700">Total Obligations</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(
                          (parseFloat(existingEmi) || 0) + 
                          (parseFloat(proposedEmi) || 0) + 
                          (parseFloat(otherObligations) || 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-purple-300">
                      <span className="text-sm font-medium text-gray-700">Available Income</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(
                          (parseFloat(monthlyIncome) || 0) - 
                          (parseFloat(existingEmi) || 0) - 
                          (parseFloat(proposedEmi) || 0) - 
                          (parseFloat(otherObligations) || 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FOIR Guidelines */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">FOIR Guidelines</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Below 40% - Excellent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>40% - 50% - Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>50% - 60% - Fair</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Above 60% - Poor</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
