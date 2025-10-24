# Wefixico Quote Agent & Two-Tier Fee Structure - Complete Reference

## 💡 The Model

Wefixico charges fees on **both sides** of the marketplace:

1. **Customer pays 12.5% markup** on job value
2. **Partner pays 6.5% fee** on job value  
3. **Total platform revenue: ~16.9%** of customer payment

## 📊 Example Calculation

### Job: 2 Three-Seater Sofas + 1 Flat Screen TV

```
┌─────────────────────────────────────────────────┐
│ BASE CALCULATION                                │
├─────────────────────────────────────────────────┤
│ Volume: 4.0 yd³ → Rounds to 4.5 yd³             │
│ Base Price: £146.67                             │
│ Extra (TV): £20.00                              │
│ Job Value: £166.67                              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ CUSTOMER SIDE (12.5% Fee)                       │
├─────────────────────────────────────────────────┤
│ Job Value: £166.67                              │
│ + Wefixico Fee (12.5%): £20.83                  │
│ = Customer Pays: £187.50                        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ PARTNER SIDE (6.5% Fee)                         │
├─────────────────────────────────────────────────┤
│ Job Value: £166.67                              │
│ - Platform Fee (6.5%): £10.83                   │
│ = Partner Payout: £155.84                       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ WEFIXICO REVENUE                                │
├─────────────────────────────────────────────────┤
│ Customer Fee: £20.83                            │
│ Partner Fee: £10.83                             │
│ Total Income: £31.66                            │
│                                                 │
│ As % of job value: 18.98%                       │
│ As % of customer payment: 16.88%                │
└─────────────────────────────────────────────────┘
```

## 👥 What Each Party Sees

### Customer (WhatsApp)
```
📦 Waste Removal Quote

Estimated Volume: 4.5 yd³
Additional Items: £20.00

Total Price: £187.50

Would you like to book this job?
```

**Customer perspective:** Clean, simple, all-inclusive pricing

---

### Partner (Dashboard)
```
╔════════════════════════════════════╗
║    YOUR PAYOUT: £155.84            ║
╠════════════════════════════════════╣
║ Job Value:           £166.67       ║
║ Platform Fee (6.5%): -£10.83       ║
║ ──────────────────────────────     ║
║ You Get:             £155.84       ║
╚════════════════════════════════════╝
```

**Partner perspective:** Transparent fee breakdown, knows exact earnings

---

### Wefixico (Internal)
```json
{
  "customer_pays": 187.50,
  "job_value": 166.67,
  "wefixico_customer_fee": 20.83,
  "partner_platform_fee": 10.83,
  "partner_payout": 155.84,
  "total_revenue": 31.66
}
```

**Platform perspective:** Complete financial breakdown for reporting

## 🎯 Fee Breakdown by Job Size

| Job Type | Job Value | Customer Pays | Partner Gets | Wefixico Earns |
|----------|-----------|---------------|--------------|----------------|
| Small (3 bags) | £83.33 | £93.75 | £77.91 | £15.84 |
| Medium (2 sofas + TV) | £166.67 | £187.50 | £155.84 | £31.66 |
| Large (house clear) | £340.00 | £382.50 | £317.90 | £64.60 |

## 🔄 Money Flow Diagram

```
                    CUSTOMER
                       ↓
                  Pays £187.50
                       ↓
                    WEFIXICO
                       ↓
        ┌──────────────┴──────────────┐
        ↓                             ↓
  Keeps £20.83                  Job Pool £166.67
  (Customer Fee)                      ↓
                        ┌─────────────┴─────────────┐
                        ↓                           ↓
                  Keeps £10.83              Pays £155.84
                 (Partner Fee)               to PARTNER
                        
Total Wefixico: £31.66
Total Partner: £155.84
```

## ⚖️ Why This Structure?

### Customer-Side Fee (12.5%)
**Justification:**
- Instant AI-powered quotes
- 24/7 WhatsApp booking
- Customer support
- Quality assurance
- Platform maintenance

**Market Comparison:**
- Standard service markup: 10-30%
- Wefixico: 12.5% (competitive)

### Partner-Side Fee (6.5%)
**Justification:**
- Job distribution system
- Payment processing & guarantee
- Customer acquisition (no marketing costs for partner)
- Dispute resolution
- Platform tools

**Market Comparison:**
- Uber/Lyft: 25-30%
- TaskRabbit: 15%
- Upwork: 5-20%
- Wefixico: 6.5% (highly competitive)

### Combined Effective Rate (~17%)
**Market Comparison:**
- Most service marketplaces: 20-35%
- Wefixico: ~17% (below average, competitive)

## 📱 Partner Communication

### In Partner Terms of Service:
> "Wefixico charges a 6.5% platform fee on all jobs. This fee covers job distribution, payment processing, customer acquisition, and platform support."

### In Partner Dashboard:
- Always show transparent breakdown
- Job value → Platform fee → Net payout
- Make it clear and simple

### Partner FAQ:
**Q: Why is there a platform fee?**
A: The 6.5% fee covers job distribution, payment processing, customer support, and platform maintenance. We bring you customers without you spending on marketing.

**Q: How does this compare to other platforms?**
A: Our 6.5% fee is highly competitive. Uber charges 25-30%, TaskRabbit charges 15%, and other platforms charge 15-30%.

**Q: Are there any other fees?**
A: No hidden fees. The 6.5% platform fee is the only deduction. You receive payment directly to your account.

## 💼 For Internal Team

### Sales Pitch to Partners:
- "Only 6.5% platform fee - one of the lowest in the industry"
- "Transparent pricing - no hidden fees"
- "Regular work stream without marketing costs"
- "Get paid 100% of what you earn after our small platform fee"

### Financial Reporting:
```sql
-- Daily revenue by source
SELECT 
  SUM(wefixico_fee) as customer_fees,
  SUM(partner_platform_fee) as partner_fees,
  SUM(wefixico_income) as total_revenue,
  AVG(wefixico_income / customer_pays * 100) as avg_take_rate
FROM jobs
WHERE completed_at >= CURRENT_DATE
```

## 🎨 Visual Representation

### For Presentations:

```
Customer Payment: £187.50 (100%)
    ├─ 11.1% → Wefixico (customer fee)
    ├─  5.8% → Wefixico (partner fee)  
    └─ 83.1% → Partner payout

Total Platform Revenue: 16.9%
Total Partner Revenue: 83.1%
```

## 🚨 Important Reminders

1. ✅ Both fees calculated on **job value** (not compounded)
2. ✅ Customer sees **only total price** (no fee breakdown)
3. ✅ Partner sees **full transparency** (builds trust)
4. ✅ All fees stored in database (audit trail)
5. ✅ Total take rate **~17%** (competitive)
6. ✅ Partner fee **clearly disclosed** (in ToS and dashboard)

## 📞 Quick Answers

**"How much does Wefixico make per job?"**
→ ~17% of customer payment (12.5% + 6.5% fees)

**"What does the partner get?"**
→ ~83% of customer payment (job value minus 6.5%)

**"Is this competitive?"**
→ Yes. Most platforms take 20-35%, we take ~17%

**"Why two fees instead of one?"**
→ Fair split - both customer and partner contribute. Industry standard for two-sided marketplaces.

**"Do customers know about the fees?"**
→ No. They see simple all-inclusive pricing. Partners see transparent breakdown.
